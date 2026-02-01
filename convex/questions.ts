import { paginationOptsValidator } from 'convex/server';
import { v } from 'convex/values';

import type { Doc, Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { mutation, query } from './_generated/server';
import {
  _internalDeleteQuestion,
  _internalInsertQuestion,
  _internalUpdateQuestion,
} from './questionsAggregateSync';
import { validateNoBlobs } from './utils';

// ==========================================================================
// HELPER FUNCTIONS FOR QUESTION CONTENT
// ==========================================================================

/**
 * Get question content from the questionContent table.
 * Falls back to question fields during migration period.
 */
async function getQuestionContent(
  ctx: QueryCtx | MutationCtx,
  questionId: Id<'questions'>,
  question?: Doc<'questions'> | null,
) {
  // First try to get from questionContent table
  const content = await ctx.db
    .query('questionContent')
    .withIndex('by_question', (q) => q.eq('questionId', questionId))
    .unique();

  if (content) {
    return {
      questionTextString: content.questionTextString,
      explanationTextString: content.explanationTextString,
      alternatives: content.alternatives,
    };
  }

  // Fall back to question fields during migration
  if (question) {
    return {
      questionTextString: question.questionTextString ?? '',
      explanationTextString: question.explanationTextString ?? '',
      alternatives: question.alternatives ?? [],
    };
  }

  return null;
}

/**
 * Get a question with its content merged in.
 * Used by getById and other queries that need full question data.
 */
async function getQuestionWithContent(
  ctx: QueryCtx | MutationCtx,
  questionId: Id<'questions'>,
) {
  const question = await ctx.db.get(questionId);
  if (!question) return null;

  const content = await getQuestionContent(ctx, questionId, question);

  return {
    ...question,
    // Merge content, ensuring we always have these fields
    questionTextString: content?.questionTextString ?? question.questionTextString ?? '',
    explanationTextString: content?.explanationTextString ?? question.explanationTextString ?? '',
    alternatives: content?.alternatives ?? question.alternatives ?? [],
  };
}

/**
 * Batch get questions with their content.
 * More efficient than calling getQuestionWithContent multiple times.
 */
async function getManyQuestionsWithContent(
  ctx: QueryCtx | MutationCtx,
  questionIds: Id<'questions'>[],
) {
  // Batch fetch all questions
  const questions = await Promise.all(
    questionIds.map((id) => ctx.db.get(id)),
  );

  // Batch fetch all content
  const contents = await Promise.all(
    questionIds.map((id) =>
      ctx.db
        .query('questionContent')
        .withIndex('by_question', (q) => q.eq('questionId', id))
        .unique(),
    ),
  );

  // Merge questions with their content
  return questions.map((question, index) => {
    if (!question) return null;

    const content = contents[index];
    return {
      ...question,
      questionTextString: content?.questionTextString ?? question.questionTextString ?? '',
      explanationTextString: content?.explanationTextString ?? question.explanationTextString ?? '',
      alternatives: content?.alternatives ?? question.alternatives ?? [],
    };
  });
}

// ==========================================================================
// QUERIES
// ==========================================================================

export const create = mutation({
  args: {
    // Accept stringified content from frontend
    questionTextString: v.string(),
    explanationTextString: v.string(),
    questionCode: v.optional(v.string()),
    title: v.string(),
    alternatives: v.array(v.string()),
    correctAlternativeIndex: v.number(),
    themeId: v.id('themes'),
    subthemeId: v.optional(v.id('subthemes')),
    groupId: v.optional(v.id('groups')),
  },
  handler: async (ctx, args) => {
    // Validate JSON structure of string content
    try {
      const questionTextObj = JSON.parse(args.questionTextString);
      const explanationTextObj = JSON.parse(args.explanationTextString);

      // Validate structure after parsing
      if (questionTextObj.content) {
        validateNoBlobs(questionTextObj.content);
      }
      if (explanationTextObj.content) {
        validateNoBlobs(explanationTextObj.content);
      }
    } catch (error: any) {
      throw new Error(
        'Invalid content format: ' + (error.message || 'Unknown error'),
      );
    }

    // Prepare question metadata (lightweight fields only)
    const questionData = {
      title: args.title,
      normalizedTitle: args.title.trim().toLowerCase(),
      questionCode: args.questionCode,
      themeId: args.themeId,
      subthemeId: args.subthemeId,
      groupId: args.groupId,
      correctAlternativeIndex: args.correctAlternativeIndex,
      alternativeCount: args.alternatives.length,
      isPublic: false,
      contentMigrated: true, // New questions go directly to split tables
    };

    // Use the helper function to insert question
    const questionId = await _internalInsertQuestion(ctx, questionData);

    // Insert content into questionContent table
    await ctx.db.insert('questionContent', {
      questionId,
      questionTextString: args.questionTextString,
      explanationTextString: args.explanationTextString,
      alternatives: args.alternatives,
    });

    return questionId;
  },
});

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (context, arguments_) => {
    const questions = await context.db
      .query("questions")
      .order("desc")
      .paginate(arguments_.paginationOpts);

    // Only fetch themes for the current page of questions, not all themes
    const themes = await Promise.all(
      questions.page.map((question) => context.db.get(question.themeId)),
    );

    return {
      ...questions,
      page: questions.page.map((question, index) => ({
        ...question,
        theme: themes[index],
      })),
    };
  },
});

export const getById = query({
  args: { id: v.id('questions') },
  handler: async (ctx, args) => {
    // Get question with content merged in
    const question = await getQuestionWithContent(ctx, args.id);
    if (!question) {
      throw new Error('Question not found');
    }

    // Fetch related taxonomy data
    const theme = await ctx.db.get(question.themeId);
    const subtheme = question.subthemeId
      ? await ctx.db.get(question.subthemeId)
      : undefined;

    return {
      ...question,
      theme,
      subtheme,
    };
  },
});

export const update = mutation({
  args: {
    id: v.id('questions'),
    // Accept stringified content from frontend
    questionTextString: v.string(),
    explanationTextString: v.string(),
    questionCode: v.optional(v.string()),
    title: v.string(),
    alternatives: v.array(v.string()),
    correctAlternativeIndex: v.number(),
    themeId: v.id('themes'),
    subthemeId: v.optional(v.id('subthemes')),
    groupId: v.optional(v.id('groups')),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Validate JSON structure of string content
    try {
      const questionTextObj = JSON.parse(args.questionTextString);
      const explanationTextObj = JSON.parse(args.explanationTextString);

      // Validate structure after parsing
      if (questionTextObj.content) {
        validateNoBlobs(questionTextObj.content);
      }
      if (explanationTextObj.content) {
        validateNoBlobs(explanationTextObj.content);
      }
    } catch (error: any) {
      throw new Error(
        'Invalid content format: ' + (error.message || 'Unknown error'),
      );
    }

    const { id, questionTextString, explanationTextString, alternatives, ...metadataFields } = args;

    // Prepare metadata updates (lightweight fields only)
    const metadataUpdates = {
      ...metadataFields,
      normalizedTitle: args.title?.trim().toLowerCase(),
      alternativeCount: alternatives.length,
      contentMigrated: true,
    };

    // Use the helper function to update question metadata
    await _internalUpdateQuestion(ctx, id, metadataUpdates);

    // Update or create content in questionContent table
    const existingContent = await ctx.db
      .query('questionContent')
      .withIndex('by_question', (q) => q.eq('questionId', id))
      .unique();

    const contentData = {
      questionTextString,
      explanationTextString,
      alternatives,
    };

    await (existingContent
      ? ctx.db.patch(existingContent._id, contentData)
      : ctx.db.insert('questionContent', { questionId: id, ...contentData }));

    return true;
  },
});

export const listAll = query({
  // WARNING: This query downloads the entire questions table and should be avoided in production
  // or with large datasets as it will consume significant bandwidth.
  // Consider using paginated queries (like 'list') or filtering server-side instead.
  handler: async (context) => {
    return await context.db.query("questions").collect();
  },
});

export const getMany = query({
  args: { ids: v.array(v.id('questions')) },
  handler: async (ctx, args) => {
    // Use batch helper to get questions with content
    const questions = await getManyQuestionsWithContent(ctx, args.ids);
    return questions;
  },
});

export const countQuestionsByMode = query({
  args: {
    questionMode: v.union(
      v.literal("all"),
      v.literal("unanswered"),
      v.literal("incorrect"),
      v.literal("bookmarked"),
    ),
  },
  handler: async (ctx) => {
    const totalQuestions = await ctx.db.query("questions").collect();
    const totalCount = totalQuestions.length;

  
    // and none are tracked as answered/incorrect/bookmarked
    const result = {
      all: totalCount,
      unanswered: totalCount,
      incorrect: 0,
      bookmarked: 0,
    };

    return result;
  },
});

export const deleteQuestion = mutation({
  args: { id: v.id('questions') },
  handler: async (ctx, args) => {
    // First delete the content from questionContent table
    const content = await ctx.db
      .query('questionContent')
      .withIndex('by_question', (q) => q.eq('questionId', args.id))
      .unique();

    if (content) {
      await ctx.db.delete(content._id);
    }

    // Then delete the question itself using the helper function
    const success = await _internalDeleteQuestion(ctx, args.id);
    return success;
  },
});

export const searchByCode = query({
  args: {
    code: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (!args.code || args.code.trim() === "") {
      return [];
    }

    // Normalize the search code
    const searchTerm = args.code.trim();

    // Use provided limit or default to 50
    const limit = args.limit || 50;

    // First search by code (since that's more specific)
    const codeResults = await ctx.db
      .query("questions")
      .withSearchIndex("search_by_code", (q) =>
        q.search("questionCode", searchTerm),
      )
      .take(limit); // Use the limit parameter

    // If we have enough code results, just return those
    if (codeResults.length >= limit) {
      const themes = await Promise.all(
        codeResults.map((question) => ctx.db.get(question.themeId)),
      );
      return codeResults.map((question, index) => ({
        _id: question._id,
        title: question.title,
        questionCode: question.questionCode,
        themeId: question.themeId,
        theme: themes[index],
      }));
    }

    // If code search didn't return enough, search by title too
    const titleResults = await ctx.db
      .query("questions")
      .withSearchIndex("search_by_title", (q) => q.search("title", searchTerm))
      .take(limit - codeResults.length);

    // Combine results, eliminating duplicates (code results take priority)
    const seenIds = new Set(codeResults.map((q) => q._id.toString()));
    const combinedResults = [
      ...codeResults,
      ...titleResults.filter((q) => !seenIds.has(q._id.toString())),
    ];

    // If we have questions, fetch their themes
    if (combinedResults.length > 0) {
      const themes = await Promise.all(
        combinedResults.map((question) => ctx.db.get(question.themeId)),
      );

      // Return minimal data to reduce bandwidth
      return combinedResults.map((question, index) => ({
        _id: question._id,
        title: question.title,
        questionCode: question.questionCode,
        themeId: question.themeId,
        theme: themes[index],
      }));
    }

    return [];
  },
});

// Add a standalone search by title function for specific title-only searches
export const searchByTitle = query({
  args: {
    title: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (!args.title || args.title.trim() === "") {
      return [];
    }

    // Normalize the search term
    const searchTerm = args.title.trim();

    // Use provided limit or default to 50
    const limit = args.limit || 50;

    // Use the search index for efficient text search
    const matchingQuestions = await ctx.db
      .query("questions")
      .withSearchIndex("search_by_title", (q) => q.search("title", searchTerm))
      .take(limit);

    // If we have questions, fetch their themes
    if (matchingQuestions.length > 0) {
      const themes = await Promise.all(
        matchingQuestions.map((question) => ctx.db.get(question.themeId)),
      );

      // Return minimal data to reduce bandwidth
      return matchingQuestions.map((question, index) => ({
        _id: question._id,
        title: question.title,
        questionCode: question.questionCode,
        themeId: question.themeId,
        theme: themes[index],
      }));
    }

    return [];
  },
});

export const getNextSequentialNumber = query({
  args: {
    codePrefix: v.string(),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    // Normalize the prefix for comparison (remove extra spaces, uppercase)
    const normalizedPrefix = args.codePrefix.trim().toUpperCase();

    // Look up the aggregate for this prefix
    const sequence = await ctx.db
      .query("questionCodeSequences")
      .withIndex("by_prefix", (q) => q.eq("codePrefix", normalizedPrefix))
      .first();

    // If no sequence exists for this prefix, start at 1
    if (!sequence) {
      return 1;
    }

    // Return the next sequential number
    return sequence.maxNumber + 1;
  },
});

// Mutation to renumber all questions with sequential codes
export const renumberAllQuestions = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all questions
    const allQuestions = await ctx.db.query("questions").order("asc").collect();

    // Group questions by their prefix (everything before the number)
    const questionsByPrefix = new Map<string, Doc<"questions">[]>();

    for (const question of allQuestions) {
      if (question.questionCode) {
        // Extract prefix (everything before the last space and digits)
        // Examples: "TESTE001" -> "TESTE", "TRA 001" -> "TRA", "TRA-FR 001" -> "TRA-FR"
        const match = question.questionCode.match(/^(.+?)\s*(\d+)$/);
        if (match) {
          const prefix = match[1].trim().toUpperCase();
          if (!questionsByPrefix.has(prefix)) {
            questionsByPrefix.set(prefix, []);
          }
          questionsByPrefix.get(prefix)!.push(question);
        }
      }
    }

    // Renumber each group
    let updatedCount = 0;
    for (const [prefix, questions] of questionsByPrefix.entries()) {
      // Sort by creation time to maintain order
      questions.sort((a, b) => a._creationTime - b._creationTime);

      // Assign sequential numbers
      let sequenceNumber = 1;
      for (const question of questions) {
        const newNumber = sequenceNumber.toString().padStart(3, '0');
        const newCode = `${prefix} ${newNumber}`;

        // Only update if the code is different
        if (question.questionCode !== newCode) {
          await ctx.db.patch(question._id, {
            questionCode: newCode,
          });
          updatedCount++;
        }
        sequenceNumber++;
      }
    }

    return {
      message: `Renumeradas ${updatedCount} questões em ${questionsByPrefix.size} grupos`,
      updatedCount,
      groupsCount: questionsByPrefix.size,
    };
  },
});

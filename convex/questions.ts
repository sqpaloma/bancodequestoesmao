import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

import { api, internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import {
  // Keep these for defining the actual mutations/queries
  internalAction,
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import {
  _internalDeleteQuestion,
  _internalInsertQuestion,
  _internalUpdateQuestion,
} from "./questionsAggregateSync";
import { validateNoBlobs } from "./utils";

// Question stats are now handled by aggregates and triggers

export const create = mutation({
  args: {
    // Accept stringified content from frontend
    questionTextString: v.string(),
    explanationTextString: v.string(),
    questionCode: v.optional(v.string()),
    title: v.string(),
    alternatives: v.array(v.string()),
    correctAlternativeIndex: v.number(),
    themeId: v.id("themes"),
    subthemeId: v.optional(v.id("subthemes")),
    groupId: v.optional(v.id("groups")),
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
        "Invalid content format: " + (error.message || "Unknown error"),
      );
    }

    // Prepare data and call the internal helper
    const questionData = {
      ...args,
      // Set migration flag
      normalizedTitle: args.title.trim().toLowerCase(),
      isPublic: false, // Default value
    };

    // Use the helper function
    const questionId = await _internalInsertQuestion(ctx, questionData);
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
  args: { id: v.id("questions") },
  handler: async (context, arguments_) => {
    const question = await context.db.get(arguments_.id);
    if (!question) {
      throw new Error("Question not found");
    }

    const theme = await context.db.get(question.themeId);

    const subtheme = question.subthemeId
      ? await context.db.get(question.subthemeId)
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
    id: v.id("questions"),
    // Accept stringified content from frontend
    questionTextString: v.string(),
    explanationTextString: v.string(),
    questionCode: v.optional(v.string()),
    title: v.string(),
    alternatives: v.array(v.string()),
    correctAlternativeIndex: v.number(),
    themeId: v.id("themes"),
    subthemeId: v.optional(v.id("subthemes")),
    groupId: v.optional(v.id("groups")),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Validate JSON structure of string content
    try {
      const questionTextObj = JSON.parse(args.questionTextString);
      const explanationTextObj = JSON.parse(args.explanationTextString);
      console.log("questionTextObj", questionTextObj);

      // Validate structure after parsing
      if (questionTextObj.content) {
        validateNoBlobs(questionTextObj.content);
      }
      if (explanationTextObj.content) {
        validateNoBlobs(explanationTextObj.content);
      }
    } catch (error: any) {
      throw new Error(
        "Invalid content format: " + (error.message || "Unknown error"),
      );
    }

    // Don't need to check if question exists here, helper does it

    const { id, ...otherFields } = args;

    // Prepare update data
    const updates = {
      ...otherFields,

      normalizedTitle: args.title?.trim().toLowerCase(), // Handle optional title in updates
    };

    // Use the helper function
    await _internalUpdateQuestion(ctx, id, updates);

    return true; // Indicate success
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
  args: { ids: v.array(v.id("questions")) },
  handler: async (ctx, args) => {
    const questions = await Promise.all(args.ids.map((id) => ctx.db.get(id)));
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
  args: { id: v.id("questions") },
  handler: async (ctx, args) => {
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
  handler: async (ctx, args) => {
    // Search for all questions that start with the given prefix
    const matchingQuestions = await ctx.db
      .query("questions")
      .withSearchIndex("search_by_code", (q) =>
        q.search("questionCode", args.codePrefix),
      )
      .collect();

    // Filter to only include questions that actually start with the prefix
    // and extract the numeric suffix
    const numbers: number[] = [];
    const prefixRegex = new RegExp(`^${args.codePrefix}\\s*(\\d+)$`, 'i');

    for (const question of matchingQuestions) {
      if (question.questionCode) {
        const match = question.questionCode.match(prefixRegex);
        if (match && match[1]) {
          numbers.push(parseInt(match[1], 10));
        }
      }
    }

    // If no questions found with this prefix, start at 1
    if (numbers.length === 0) {
      return 1;
    }

    // Return the highest number + 1
    const maxNumber = Math.max(...numbers);
    return maxNumber + 1;
  },
});

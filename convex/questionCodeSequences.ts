import { v } from "convex/values";

import { internalMutation, mutation } from "./_generated/server";

/**
 * Helper function to extract prefix and number from a question code
 * Examples: "TESTE001" -> {prefix: "TESTE", number: 1}
 *          "TRA 001" -> {prefix: "TRA", number: 1}
 *          "TRA-FR 001" -> {prefix: "TRA-FR", number: 1}
 */
function parseQuestionCode(code: string): {
  prefix: string;
  number: number;
} | null {
  const normalizedCode = code.trim().toUpperCase();
  const match = normalizedCode.match(/^(.+?)\s*(\d+)$/);

  if (!match) {
    return null;
  }

  return {
    prefix: match[1].trim(),
    number: parseInt(match[2], 10),
  };
}

/**
 * Update the sequence aggregate when a question code is created or updated
 * This ensures the maxNumber aggregate is always up to date
 */
export const updateSequenceForCode = internalMutation({
  args: {
    questionCode: v.string(),
  },
  handler: async (ctx, args) => {
    const parsed = parseQuestionCode(args.questionCode);
    if (!parsed) {
      return; // Invalid code format, skip
    }

    const { prefix, number } = parsed;

    // Find existing sequence for this prefix
    const existing = await ctx.db
      .query("questionCodeSequences")
      .withIndex("by_prefix", (q) => q.eq("codePrefix", prefix))
      .first();

    if (!existing) {
      // Create new sequence
      await ctx.db.insert("questionCodeSequences", {
        codePrefix: prefix,
        maxNumber: number,
      });
    } else if (number > existing.maxNumber) {
      // Update if this number is higher
      await ctx.db.patch(existing._id, {
        maxNumber: number,
      });
    }
  },
});

/**
 * Initialize or repair sequences from existing questions
 * This scans all questions with a specific prefix and rebuilds the aggregate
 * Safe for production use with pagination
 */
export const initializeSequencesFromQuestions = mutation({
  args: {},
  handler: async (ctx) => {
    let processedCount = 0;
    const prefixMaxNumbers = new Map<string, number>();

    // Paginate through all questions to avoid memory issues
    let cursor = null;
    let isDone = false;

    while (!isDone) {
      const batch = await ctx.db
        .query("questions")
        .paginate({ cursor, numItems: 100 });

      for (const question of batch.page) {
        if (question.questionCode) {
          const parsed = parseQuestionCode(question.questionCode);
          if (parsed) {
            const { prefix, number } = parsed;
            const currentMax = prefixMaxNumbers.get(prefix) || 0;
            if (number > currentMax) {
              prefixMaxNumbers.set(prefix, number);
            }
            processedCount++;
          }
        }
      }

      cursor = batch.continueCursor;
      isDone = batch.isDone;
    }

    // Update or create sequences for all found prefixes
    let updatedSequences = 0;
    for (const [prefix, maxNumber] of prefixMaxNumbers.entries()) {
      const existing = await ctx.db
        .query("questionCodeSequences")
        .withIndex("by_prefix", (q) => q.eq("codePrefix", prefix))
        .first();

      if (!existing) {
        await ctx.db.insert("questionCodeSequences", {
          codePrefix: prefix,
          maxNumber,
        });
        updatedSequences++;
      } else if (maxNumber > existing.maxNumber) {
        await ctx.db.patch(existing._id, {
          maxNumber,
        });
        updatedSequences++;
      }
    }

    return {
      message: `Processadas ${processedCount} questões, atualizadas ${updatedSequences} sequências`,
      processedQuestions: processedCount,
      updatedSequences,
      totalPrefixes: prefixMaxNumbers.size,
    };
  },
});

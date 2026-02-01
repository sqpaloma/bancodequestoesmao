import { Migrations } from '@convex-dev/migrations';

import { components, internal } from './_generated/api.js';
import { DataModel } from './_generated/dataModel.js';

export const migrations = new Migrations<DataModel>(components.migrations);
export const run = migrations.runner();

// ==========================================================================
// QUESTION CONTENT SPLIT MIGRATIONS
// ==========================================================================
// These migrations split the questions table into two tables:
// - questions: Lightweight metadata for listings/filtering
// - questionContent: Heavy content fields loaded on demand
// ==========================================================================

/**
 * Migration 1: Copy content from questions to questionContent table
 *
 * This migration:
 * 1. Creates a questionContent document for each question
 * 2. Copies the heavy fields (questionTextString, explanationTextString, alternatives)
 * 3. Sets contentMigrated flag and alternativeCount on the question
 *
 * Run with: npx convex run migrations:run '{"fn": "migrations:copyContentToNewTable"}'
 */
export const copyContentToNewTable = migrations.define({
  table: 'questions',
  migrateOne: async (ctx, question) => {
    // Skip if already migrated
    if (question.contentMigrated) return;

    // Check if content already exists in new table
    const existing = await ctx.db
      .query('questionContent')
      .withIndex('by_question', q => q.eq('questionId', question._id))
      .first();

    // Only create content if it doesn't exist and question has content
    if (
      !existing &&
      question.questionTextString &&
      question.explanationTextString &&
      question.alternatives
    ) {
      await ctx.db.insert('questionContent', {
        questionId: question._id,
        questionTextString: question.questionTextString,
        explanationTextString: question.explanationTextString,
        alternatives: question.alternatives,
        // Copy legacy fields if they exist
        questionText: question.questionText,
        explanationText: question.explanationText,
      });
    }

    // Mark as migrated and add alternativeCount
    // Using shorthand syntax: returning object applies as patch
    return {
      contentMigrated: true,
      alternativeCount: question.alternatives?.length ?? 0,
    };
  },
});

/**
 * Migration 2: Clear content from questions table
 *
 * Run AFTER verifying all reads use questionContent table.
 * This clears the deprecated content fields to reduce storage.
 *
 * Test with dry run first:
 * npx convex run migrations:run '{"fn": "migrations:clearContentFromQuestions", "dryRun": true}'
 *
 * Run with: npx convex run migrations:run '{"fn": "migrations:clearContentFromQuestions"}'
 */
export const clearContentFromQuestions = migrations.define({
  table: 'questions',
  migrateOne: async (_ctx, question) => {
    // Only clear if content was migrated
    if (!question.contentMigrated) return;

    // Clear deprecated fields
    return {
      questionTextString: undefined,
      explanationTextString: undefined,
      alternatives: undefined,
      questionText: undefined,
      explanationText: undefined,
    };
  },
});

/**
 * Runner to execute all content split migrations in sequence
 *
 * Run with: npx convex run migrations:runContentSplitMigrations
 */
export const runContentSplitMigrations = migrations.runner([
  internal.migrations.copyContentToNewTable,
]);

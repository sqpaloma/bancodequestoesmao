import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  themes: defineTable({
    tenantId: v.optional(v.id('apps')),
    name: v.string(),
    prefix: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
    // Legacy ID for cross-deployment import (stores old _id as string)
    legacyId: v.optional(v.string()),
  })
    .index('by_name', ['name'])
    .index('by_tenant', ['tenantId'])
    .index('by_tenant_and_name', ['tenantId', 'name']),

  subthemes: defineTable({
    // Multi-tenancy
    tenantId: v.optional(v.id('apps')),
    name: v.string(),
    themeId: v.optional(v.id('themes')), // Optional during import, migration will fill it
    prefix: v.optional(v.string()),
    // Legacy IDs for cross-deployment import
    legacyId: v.optional(v.string()),
    legacyThemeId: v.optional(v.string()),
  })
    .index('by_theme', ['themeId'])
    .index('by_tenant', ['tenantId'])
    .index('by_tenant_and_theme', ['tenantId', 'themeId']),

  groups: defineTable({
    // Multi-tenancy
    tenantId: v.optional(v.id('apps')),
    name: v.string(),
    subthemeId: v.optional(v.id('subthemes')), // Optional during import, migration will fill it
    prefix: v.optional(v.string()),
    // Legacy IDs for cross-deployment import
    legacyId: v.optional(v.string()),
    legacySubthemeId: v.optional(v.string()),
  })
    .index('by_subtheme', ['subthemeId'])
    .index('by_tenant', ['tenantId'])
    .index('by_tenant_and_subtheme', ['tenantId', 'subthemeId']),

  // ==========================================================================
  // QUESTION CONTENT TABLE (Heavy content - loaded on demand)
  // ==========================================================================
  questionContent: defineTable({
    questionId: v.optional(v.id('questions')), // Optional during import, migration will fill it
    questionTextString: v.string(), // Rich text JSON (heavy)
    explanationTextString: v.string(), // Rich text JSON (heavy)
    alternatives: v.array(v.string()), // Answer options
    // Legacy fields (for migration - will be removed after migration complete)
    questionText: v.optional(v.any()),
    explanationText: v.optional(v.any()),
    // Legacy IDs for cross-deployment import
    legacyId: v.optional(v.string()),
    legacyQuestionId: v.optional(v.string()),
  }).index('by_question', ['questionId']),

  // ==========================================================================
  // QUESTIONS TABLE (Lightweight metadata)
  // ==========================================================================
  questions: defineTable({
    // Multi-tenancy
    tenantId: v.optional(v.id('apps')), // Optional during migration, required after

    // Metadata (light)
    title: v.string(),
    normalizedTitle: v.string(),
    questionCode: v.optional(v.string()),
    orderedNumberId: v.optional(v.number()),

    // Taxonomy IDs (for filtering/aggregates)
    themeId: v.optional(v.id('themes')), // Optional during import, migration will fill it
    subthemeId: v.optional(v.id('subthemes')),
    groupId: v.optional(v.id('groups')),

    // Legacy IDs for cross-deployment import
    legacyId: v.optional(v.string()),
    legacyThemeId: v.optional(v.string()),
    legacySubthemeId: v.optional(v.string()),
    legacyGroupId: v.optional(v.string()),

    // DENORMALIZED: Taxonomy names (for display - no extra fetches needed)
    themeName: v.optional(v.string()),
    subthemeName: v.optional(v.string()),
    groupName: v.optional(v.string()),

    // Quiz essentials (keep in main table for quiz generation)
    correctAlternativeIndex: v.number(),
    alternativeCount: v.optional(v.number()), // Just the count, not full content

    // Other metadata
    authorId: v.optional(v.id('users')),
    isPublic: v.optional(v.boolean()),

    // Migration tracking
    contentMigrated: v.optional(v.boolean()), // True when content moved to questionContent table

    // ==========================================================================
    // DEPRECATED FIELDS - TO BE REMOVED AFTER MIGRATION
    // ==========================================================================
    // These fields are being migrated to the questionContent table.
    //
    // MIGRATION STATUS:
    // 1. ✅ All READ operations now use questionContent table
    // 2. ✅ All WRITE operations now write to questionContent table only
    // 3. ⏳ Run clearContentFromQuestions migration to clear this data
    // 4. ⏳ After migration completes, remove these field definitions
    //
    // TO COMPLETE MIGRATION:
    // 1. Run: npx convex run migrations:run '{"fn": "migrations:clearContentFromQuestions"}'
    // 2. Verify all questions work correctly
    // 3. Remove the deprecated field definitions below
    // ==========================================================================
    questionText: v.optional(v.any()), // DEPRECATED: Use questionContent.questionTextString
    explanationText: v.optional(v.any()), // DEPRECATED: Use questionContent.explanationTextString
    questionTextString: v.optional(v.string()), // DEPRECATED: Use questionContent.questionTextString
    explanationTextString: v.optional(v.string()), // DEPRECATED: Use questionContent.explanationTextString
    alternatives: v.optional(v.array(v.string())), // DEPRECATED: Use questionContent.alternatives

    // Legacy taxonomy fields (for migration cleanup only)
    TaxThemeId: v.optional(v.string()),
    TaxSubthemeId: v.optional(v.string()),
    TaxGroupId: v.optional(v.string()),
    taxonomyPathIds: v.optional(v.array(v.string())),
  })
    .index('by_title', ['normalizedTitle'])
    .index('by_theme', ['themeId'])
    .index('by_subtheme', ['subthemeId'])
    .index('by_group', ['groupId'])
    // Tenant-first indexes for multi-tenancy
    .index('by_tenant', ['tenantId'])
    .index('by_tenant_and_theme', ['tenantId', 'themeId'])
    .index('by_tenant_and_subtheme', ['tenantId', 'subthemeId'])
    .index('by_tenant_and_group', ['tenantId', 'groupId'])
    .searchIndex('search_by_title', { searchField: 'title' })
    .searchIndex('search_by_code', { searchField: 'questionCode' }),

  // Aggregate table to track the maximum sequential number per question code prefix
  // This allows O(1) lookup instead of O(n) scanning all questions
});

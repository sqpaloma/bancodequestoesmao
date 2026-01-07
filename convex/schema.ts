import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  themes: defineTable({
    name: v.string(),
    prefix: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
  }).index('by_name', ['name']),

  subthemes: defineTable({
    name: v.string(),
    themeId: v.id('themes'),
    prefix: v.optional(v.string()),
  }).index('by_theme', ['themeId']),

  groups: defineTable({
    name: v.string(),
    subthemeId: v.id('subthemes'),
    prefix: v.optional(v.string()),
  }).index('by_subtheme', ['subthemeId']),

  questions: defineTable({
    title: v.string(),
    normalizedTitle: v.string(),
    questionCode: v.optional(v.string()),
    orderedNumberId: v.optional(v.number()),
    questionText: v.optional(v.any()),
    explanationText: v.optional(v.any()),
    questionTextString: v.string(),
    explanationTextString: v.string(),
    contentMigrated: v.optional(v.boolean()),
    alternatives: v.array(v.string()),
    correctAlternativeIndex: v.number(),
    themeId: v.id('themes'),
    subthemeId: v.optional(v.id('subthemes')),
    groupId: v.optional(v.id('groups')),
    isPublic: v.optional(v.boolean()),
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
    .searchIndex('search_by_title', { searchField: 'title' })
    .searchIndex('search_by_code', { searchField: 'questionCode' }),

  // Aggregate table to track the maximum sequential number per question code prefix
  // This allows O(1) lookup instead of O(n) scanning all questions
  questionCodeSequences: defineTable({
    codePrefix: v.string(), // The normalized prefix (e.g., "TESTE", "TRA", "TRA-FR")
    maxNumber: v.number(),  // The highest sequential number used with this prefix
  }).index('by_prefix', ['codePrefix']),

  users: defineTable({
    clerkUserId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    imageUrl: v.optional(v.string()),
    onboardingCompleted: v.boolean(),
    role: v.union(v.literal("user"), v.literal("admin")),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("suspended"),
    ),
    hasActiveYearAccess: v.boolean(),
    paid: v.boolean(),
    paymentDate: v.optional(v.number()),
    paymentId: v.optional(v.string()),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded"),
    ),
    testeId: v.optional(v.string()),
  })
    .index("by_clerkUserId", ["clerkUserId"])
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_hasActiveYearAccess", ["hasActiveYearAccess"]),

});

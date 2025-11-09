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

});

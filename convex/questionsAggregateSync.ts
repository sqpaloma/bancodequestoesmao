import type { GenericMutationCtx } from "convex/server";

import type { DataModel, Doc, Id } from "./_generated/dataModel";
// Question stats are now handled by aggregates and triggers

// ---------- Helper Functions for Question CRUD + Aggregate Sync ----------

// Use GenericMutationCtx with DataModel
export async function _internalInsertQuestion(
  ctx: GenericMutationCtx<DataModel>,
  data: Omit<Doc<"questions">, "_id" | "_creationTime">,
) {
  const questionId = await ctx.db.insert("questions", data);

  return questionId;
}

export async function _internalUpdateQuestion(
  ctx: GenericMutationCtx<DataModel>,
  id: Id<"questions">,
  updates: Partial<Doc<"questions">>,
) {
  const oldQuestionDoc = await ctx.db.get(id);
  if (!oldQuestionDoc) {
    throw new Error(`Question not found for update: ${id}`);
  }
  await ctx.db.patch(id, updates);

  // Check if any taxonomy fields changed
  const taxonomyChanged =
    (updates.themeId && updates.themeId !== oldQuestionDoc.themeId) ||
    (updates.subthemeId !== undefined &&
      updates.subthemeId !== oldQuestionDoc.subthemeId) ||
    (updates.groupId !== undefined &&
      updates.groupId !== oldQuestionDoc.groupId);

  if (taxonomyChanged) {
    console.log(`Question ${id} taxonomy changed, updating aggregates...`);
  }
}

export async function _internalDeleteQuestion(
  ctx: GenericMutationCtx<DataModel>,
  id: Id<"questions">,
) {
  const questionDoc = await ctx.db.get(id);
  if (!questionDoc) {
    console.warn(`Question not found for deletion: ${id}`);
    return false; // Indicate deletion didn't happen
  }
  await ctx.db.delete(id);

  // Handle ALL aggregate operations with comprehensive error recovery
  // If any operation fails with DELETE_MISSING_KEY, just skip it and continue

  console.log(`Attempting to delete question ${id} from aggregates...`);

  return true; // Indicate successful deletion
}

// -----------------------------------------------------------------------

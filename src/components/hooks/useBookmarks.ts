import { useMutation, useQuery } from 'convex/react';

import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';

export function useBookmarks(questionIds?: Id<'questions'>[]) {
  // Get bookmark status for all provided questions (if any)
  const bookmarkStatuses = useQuery(
    api.bookmark.getBookmarkStatusForQuestions,
    questionIds && questionIds.length > 0 ? { questionIds } : 'skip',
  );

  // Toggle bookmark mutation
  const toggleBookmark = useMutation(api.bookmark.toggleBookmark);

  // Get all bookmarked questions
  const bookmarkedQuestions = useQuery(api.bookmark.getBookmarkedQuestions);

  return {
    // For checking if specific questions are bookmarked
    bookmarkStatuses: bookmarkStatuses || {},

    // For toggling bookmark status
    toggleBookmark,

    // For getting full list of bookmarked questions
    bookmarkedQuestions: bookmarkedQuestions || [],

    // Loading state
    isLoading: bookmarkStatuses === undefined,
  };
}

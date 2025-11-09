import { useQuery } from 'convex/react';

import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';

export default function useSession(
  quizId: Id<'presetQuizzes'> | Id<'customQuizzes'>,
) {
  //using new function
  const progress = useQuery(api.quizSessions.getActiveSession, { quizId });
  return progress;
}

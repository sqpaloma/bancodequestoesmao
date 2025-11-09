import { useQuery } from 'convex/react';
import { useState } from 'react';

import { api } from '../../../../../../../convex/_generated/api';
import { Id } from '../../../../../../../convex/_generated/dataModel';

export function useQuestionDetail(questionId: Id<'questions'>) {
  const [isEditing, setIsEditing] = useState(false);

  // Fetch question data
  const question = useQuery(api.questions.getById, { id: questionId });

  // Toggle edit mode
  const startEditing = () => setIsEditing(true);
  const cancelEditing = () => setIsEditing(false);

  // Handle successful edit
  const handleEditSuccess = () => {
    setIsEditing(false);
  };

  return {
    question,
    isLoading: question === undefined,
    isEditing,
    startEditing,
    cancelEditing,
    handleEditSuccess,
  };
}

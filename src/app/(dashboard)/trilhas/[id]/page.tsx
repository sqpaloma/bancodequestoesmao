'use client';

import { useParams } from 'next/navigation';

import Quiz from '@/components/quiz/Quiz';

import { Id } from '../../../../../convex/_generated/dataModel';

export default function TemaQuizPage() {
  const { id } = useParams() as {
    id: Id<'presetQuizzes'>;
  };

  // Hardcoded study mode for tema quizzes
  return <Quiz quizId={id} mode="study" />;
}

'use client';

import { useParams } from 'next/navigation';

import Quiz from '@/components/quiz/Quiz';

import { Id } from '../../../../../convex/_generated/dataModel';

export default function SimuladoQuizPage() {
  const { id } = useParams() as {
    id: Id<'presetQuizzes'>;
  };

  // Hardcoded exam mode for simulado quizzes
  return <Quiz quizId={id} mode="exam" />;
}

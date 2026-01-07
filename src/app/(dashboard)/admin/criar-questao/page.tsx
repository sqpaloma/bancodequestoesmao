import { requireAdminServer } from '@/lib/server-auth';

import { QuestionForm } from './_components/question-form';

export default async function CreateQuestionPage() {
  await requireAdminServer();

  return (
    <div className="mx-auto max-w-5xl px-2 md:px-6">
      <QuestionForm />
    </div>
  );
}

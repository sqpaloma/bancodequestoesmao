'use client';

import { Button } from '@/components/ui/button';
import { renderContent } from '@/lib/utils/render-content';

interface QuestionDisplayProps {
  question: any; // Replace with proper type when available
  onEdit: () => void;
  onBack: () => void;
}

export function QuestionDisplay({
  question,
  onEdit,
  onBack,
}: QuestionDisplayProps) {
  // Convert TipTap JSON to HTML
  const questionHtml = renderContent(JSON.parse(question.questionTextString));
  const explanationHtml = renderContent(JSON.parse(question.explanationTextString));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{question.title}</h1>
        <div className="space-x-2">
          <Button onClick={onEdit}>Editar</Button>
          <Button variant="outline" onClick={onBack}>
            Voltar
          </Button>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl rounded-3xl border bg-white p-6">
        <div className="space-y-6">
          <div>
            <h2 className="mb-4 font-semibold">Pergunta:</h2>
            <div
              className="prose max-w-none break-words"
              dangerouslySetInnerHTML={{ __html: questionHtml }}
            />
          </div>

          <div>
              
            <div className="mt-4 space-y-2">
              {question.alternatives?.map(
                (alternative: string, index: number) => (
                  <div
                    key={index}
                    className={`w-full rounded-lg border p-4 text-left ${
                      index === question.correctAlternativeIndex
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`break-words ${
                          index === question.correctAlternativeIndex
                            ? 'font-medium text-green-600'
                            : ''
                        }`}
                      >
                        {index + 1}. {alternative}
                        {index === question.correctAlternativeIndex && ' ✓'}
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>

          <div>
            <h2 className="mb-4 font-semibold">Explicação:</h2>
            <div className="mt-6 rounded-lg border border-brand-blue/20 bg-brand-blue/10 p-4">
              <div className="prose mt-2 max-w-none break-words">
                <div dangerouslySetInnerHTML={{ __html: explanationHtml }} />
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-4 font-semibold">Informações Adicionais:</h2>
            <p>Tema: {question.theme?.name}</p>
            {question.subtheme && <p>Subtema: {question.subtheme.name}</p>}
            <p>Status: {question.isPublic ? 'Publicada' : 'Rascunho'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

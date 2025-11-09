'use client';

import React from 'react';
import { type UseFormReturn } from 'react-hook-form';

import RichTextEditor from '@/components/rich-text-editor/rich-text-editor';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { QuestionFormData } from '../schema';

interface QuestionTextProps {
  form: UseFormReturn<QuestionFormData>;
  initialContent?: any;
  onEditorReady: (editor: any) => void;
}

export function QuestionText({
  form,
  initialContent,
  onEditorReady,
}: QuestionTextProps) {
  // Parse JSON string if needed for TipTap editor
  const parsedInitialContent = React.useMemo(() => {
    if (!initialContent) return;
    if (typeof initialContent === 'string') {
      try {
        return JSON.parse(initialContent);
      } catch (error) {
        console.error('Failed to parse initial question text content:', error);
        return;
      }
    }
    return initialContent;
  }, [initialContent]);

  return (
    <FormField
      control={form.control}
      name="questionTextString"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Texto da Questão</FormLabel>
          <FormControl>
            <RichTextEditor
              onChange={content => {
                const stringifiedContent = JSON.stringify(content);
                field.onChange(stringifiedContent);
              }}
              initialContent={parsedInitialContent}
              onEditorReady={onEditorReady}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

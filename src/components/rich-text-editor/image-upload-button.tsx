'use client';

import { Editor } from '@tiptap/react';
import { ImageIcon } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

import type { ImageAttributes } from './rich-text-editor';

// Keep track of temporary images
interface PendingUpload {
  file: File;
  blobUrl: string;
}

// Use a Map to store pending uploads globally
export const pendingUploads = new Map<string, PendingUpload>();

export function ImageUploadButton({ editor }: { editor: Editor }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        setIsLoading(true);

        // Create temporary blob URL
        const blobUrl = URL.createObjectURL(file);

        // Store file and blobUrl for later upload
        pendingUploads.set(blobUrl, { file, blobUrl });

        // Insert blob URL into editor with resizable style
        const imageAttributes: ImageAttributes = {
          src: blobUrl,
          alt: file.name,
          style: 'width: 250px; height: auto; resize: both; overflow: hidden;',
        };

        editor.chain().focus().setImage(imageAttributes).run();
      } catch (error) {
        console.error('Failed to handle image:', error);
      } finally {
        setIsLoading(false);
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      }
    },
    [editor],
  );

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded-md p-2 hover:bg-gray-100"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        ) : (
          <ImageIcon className="h-5 w-5" />
        )}
      </button>
    </>
  );
}

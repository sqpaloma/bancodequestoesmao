import userEvent from '@testing-library/user-event';
import { type JSONContent } from '@tiptap/react';
import { describe, expect, test, vi } from 'vitest';

import { render, screen } from '@/tests/react-test-utils';

import RichTextEditor from './rich-text-editor';

describe('RichTextEditor', () => {
  // Core functionality tests
  describe('Core Editor Functionality', () => {
    test('renders editor with essential toolbar controls', () => {
      const mockOnChange = vi.fn();
      render(<RichTextEditor onChange={mockOnChange} />);

      // Only test essential controls that affect core functionality
      const essentialControls = [
        'Bold',
        'Italic',
        'Bullet List',
        'Ordered List',
      ];
      essentialControls.forEach(control => {
        expect(screen.getByLabelText(control)).toBeInTheDocument();
      });
    });
  });

  // Critical user interactions
  describe('Text Formatting', () => {
    test('applies bold formatting when bold button is clicked', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();

      render(<RichTextEditor onChange={mockOnChange} />);

      const boldButton = screen.getByLabelText('Bold');
      const editorContent = screen.getByRole('textbox', { hidden: true });

      await user.click(editorContent);
      await user.keyboard('Test');
      await user.click(boldButton);
      await user.keyboard(' bold');

      // Verify onChange was called with bold formatting
      expect(mockOnChange).toHaveBeenCalled();
      const calls = mockOnChange.mock.calls;
      const lastCall = calls.at(-1)?.[0] as JSONContent;
      expect(
        lastCall?.content?.some((node: any) =>
          node.content?.some((content: any) =>
            content.marks?.some((mark: any) => mark.type === 'bold'),
          ),
        ),
      ).toBe(true);
    });
  });

  // List handling
  describe('List Management', () => {
    test('creates bullet list when bullet list button is clicked', async () => {
      const mockOnChange = vi.fn();
      const user = userEvent.setup();

      render(<RichTextEditor onChange={mockOnChange} />);

      const bulletListButton = screen.getByLabelText('Bullet List');
      const editorContent = screen.getByRole('textbox', { hidden: true });

      await user.click(bulletListButton);
      await user.click(editorContent);
      await user.keyboard('List item');

      // Verify onChange was called with list formatting
      expect(mockOnChange).toHaveBeenCalled();
      const calls = mockOnChange.mock.calls;
      const lastCall = calls.at(-1)?.[0] as JSONContent;
      expect(
        lastCall?.content?.some((node: any) => node.type === 'bulletList'),
      ).toBe(true);
    });
  });

  // Error handling
  describe('Error Handling', () => {
    test('handles undefined initial content gracefully', () => {
      const mockOnChange = vi.fn();
      render(
        <RichTextEditor onChange={mockOnChange} initialContent={undefined} />,
      );

      const editorContent = screen.getByRole('textbox', { hidden: true });
      expect(editorContent).toBeInTheDocument();
    });
  });

  // State persistence
  describe('State Management', () => {
    test('maintains editor state with initial content', () => {
      const mockOnChange = vi.fn();
      const initialContent: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Initial content' }],
          },
        ],
      };

      render(
        <RichTextEditor
          onChange={mockOnChange}
          initialContent={initialContent}
        />,
      );
      expect(screen.getByText('Initial content')).toBeInTheDocument();
    });
  });
});

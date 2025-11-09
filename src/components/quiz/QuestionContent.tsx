import StructuredContentRenderer, {
  ContentNode,
} from '../common/StructuredContentRenderer';

interface QuestionContentProps {
  /**
   * @deprecated Use stringContent instead. This is kept for backward compatibility.
   */
  content?: ContentNode | string | null | undefined;
  /**
   * The preferred way to pass content - as a JSON string
   */
  stringContent?: string | null | undefined;
}

/**
 * Renders question content using either stringContent (preferred) or the legacy content object.
 * Going forward, all new code should use the stringContent prop exclusively.
 */
export default function QuestionContent({
  content,
  stringContent,
}: QuestionContentProps) {
  return (
    <div className="prose max-w-none">
      <StructuredContentRenderer node={content} stringContent={stringContent} />
    </div>
  );
}

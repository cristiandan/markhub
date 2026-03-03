'use client';

import dynamic from 'next/dynamic';
import { Skeleton, SkeletonMarkdown } from '@/components/ui/Skeleton';

// Dynamically import the heavy MarkdownRenderer to reduce initial bundle size
// react-markdown + react-syntax-highlighter add ~1MB to the bundle
const MarkdownRenderer = dynamic(
  () => import('./MarkdownRenderer').then((mod) => mod.MarkdownRenderer),
  {
    loading: () => <SkeletonMarkdown />,
    ssr: true, // Enable SSR for SEO - content will be in HTML
  }
);

export interface DynamicMarkdownProps {
  content: string;
  className?: string;
  /** Show line numbers in code blocks (default: true for blocks with >5 lines) */
  showLineNumbers?: boolean | 'auto';
}

/**
 * Dynamically loaded markdown renderer.
 * 
 * Use this component instead of MarkdownRenderer directly for better
 * initial page load performance. The heavy dependencies (react-markdown,
 * react-syntax-highlighter) are loaded on demand.
 * 
 * For SSR/SEO critical pages, the content is still rendered server-side.
 */
export function DynamicMarkdown({ content, className, showLineNumbers }: DynamicMarkdownProps) {
  return (
    <MarkdownRenderer
      content={content}
      className={className}
      showLineNumbers={showLineNumbers}
    />
  );
}

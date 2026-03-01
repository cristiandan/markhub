'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import { useState, useEffect, ComponentPropsWithoutRef } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Renders markdown content with syntax highlighting for code blocks.
 * 
 * Features:
 * - GitHub Flavored Markdown (tables, strikethrough, task lists, autolinks)
 * - Syntax highlighting with Prism (adapts to light/dark theme)
 * - Styled prose with proper spacing and typography
 */
export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch with theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const codeStyle = mounted && resolvedTheme === 'dark' ? oneDark : oneLight;

  return (
    <div className={`prose prose-neutral dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Code blocks with syntax highlighting
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !className;
            const code = String(children).replace(/\n$/, '');

            if (isInline) {
              return (
                <code
                  className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <SyntaxHighlighter
                style={codeStyle}
                language={match?.[1] || 'text'}
                PreTag="div"
                customStyle={{
                  margin: 0,
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                }}
              >
                {code}
              </SyntaxHighlighter>
            );
          },

          // Links open in new tab if external
          a({ href, children, ...props }) {
            const isExternal = href?.startsWith('http');
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="text-[var(--primary)] hover:underline"
                {...props}
              >
                {children}
              </a>
            );
          },

          // Images with responsive sizing
          img({ src, alt, ...props }) {
            return (
              <img
                src={src}
                alt={alt || ''}
                className="rounded-lg max-w-full h-auto"
                loading="lazy"
                {...props}
              />
            );
          },

          // Tables with styling
          table({ children, ...props }) {
            return (
              <div className="overflow-x-auto my-4">
                <table
                  className="min-w-full border-collapse border border-[var(--border)]"
                  {...props}
                >
                  {children}
                </table>
              </div>
            );
          },
          thead({ children, ...props }) {
            return (
              <thead className="bg-[var(--muted)]" {...props}>
                {children}
              </thead>
            );
          },
          th({ children, ...props }) {
            return (
              <th
                className="border border-[var(--border)] px-4 py-2 text-left font-semibold"
                {...props}
              >
                {children}
              </th>
            );
          },
          td({ children, ...props }) {
            return (
              <td className="border border-[var(--border)] px-4 py-2" {...props}>
                {children}
              </td>
            );
          },

          // Blockquotes
          blockquote({ children, ...props }) {
            return (
              <blockquote
                className="border-l-4 border-[var(--primary)] pl-4 italic text-[var(--muted-foreground)]"
                {...props}
              >
                {children}
              </blockquote>
            );
          },

          // Horizontal rules
          hr(props) {
            return (
              <hr
                className="my-8 border-t border-[var(--border)]"
                {...props}
              />
            );
          },

          // Task list items (GFM)
          li({ children, ...props }) {
            // Check if this is a task list item
            const firstChild = Array.isArray(children) ? children[0] : null;
            
            return (
              <li className="marker:text-[var(--muted-foreground)]" {...props}>
                {children}
              </li>
            );
          },

          // Headings with anchor links
          h1({ children, ...props }) {
            return (
              <h1 className="text-3xl font-bold mt-8 mb-4 first:mt-0" {...props}>
                {children}
              </h1>
            );
          },
          h2({ children, ...props }) {
            return (
              <h2
                className="text-2xl font-bold mt-8 mb-3 pb-2 border-b border-[var(--border)]"
                {...props}
              >
                {children}
              </h2>
            );
          },
          h3({ children, ...props }) {
            return (
              <h3 className="text-xl font-semibold mt-6 mb-3" {...props}>
                {children}
              </h3>
            );
          },
          h4({ children, ...props }) {
            return (
              <h4 className="text-lg font-semibold mt-4 mb-2" {...props}>
                {children}
              </h4>
            );
          },

          // Paragraphs
          p({ children, ...props }) {
            return (
              <p className="my-4 leading-7 first:mt-0 last:mb-0" {...props}>
                {children}
              </p>
            );
          },

          // Lists
          ul({ children, ...props }) {
            return (
              <ul className="my-4 ml-6 list-disc space-y-2" {...props}>
                {children}
              </ul>
            );
          },
          ol({ children, ...props }) {
            return (
              <ol className="my-4 ml-6 list-decimal space-y-2" {...props}>
                {children}
              </ol>
            );
          },

          // Preformatted text (for code blocks without language)
          pre({ children, ...props }) {
            return (
              <pre
                className="overflow-x-auto rounded-lg bg-[var(--muted)] p-4 my-4"
                {...props}
              >
                {children}
              </pre>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

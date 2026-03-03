'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import { useState, useEffect, useCallback } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  /** Show line numbers in code blocks (default: true for blocks with >5 lines) */
  showLineNumbers?: boolean | 'auto';
}

/** Copy button component for code blocks */
function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [code]);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-2 py-1 text-xs rounded hover:bg-white/10 transition-colors"
      title={copied ? 'Copied!' : 'Copy code'}
    >
      {copied ? (
        <>
          <CheckIcon className="w-3.5 h-3.5" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <CopyIcon className="w-3.5 h-3.5" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/** Language display names for common languages */
const languageNames: Record<string, string> = {
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  jsx: 'JSX',
  tsx: 'TSX',
  py: 'Python',
  python: 'Python',
  rb: 'Ruby',
  ruby: 'Ruby',
  go: 'Go',
  rust: 'Rust',
  rs: 'Rust',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
  cs: 'C#',
  csharp: 'C#',
  php: 'PHP',
  swift: 'Swift',
  kotlin: 'Kotlin',
  scala: 'Scala',
  sh: 'Shell',
  bash: 'Bash',
  zsh: 'Zsh',
  fish: 'Fish',
  powershell: 'PowerShell',
  ps1: 'PowerShell',
  sql: 'SQL',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  sass: 'Sass',
  less: 'Less',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  xml: 'XML',
  md: 'Markdown',
  markdown: 'Markdown',
  graphql: 'GraphQL',
  gql: 'GraphQL',
  dockerfile: 'Dockerfile',
  docker: 'Docker',
  makefile: 'Makefile',
  make: 'Makefile',
  text: 'Plain Text',
  txt: 'Plain Text',
  prisma: 'Prisma',
  toml: 'TOML',
  ini: 'INI',
  env: 'Environment',
};

function getLanguageDisplayName(lang: string): string {
  return languageNames[lang.toLowerCase()] || lang.toUpperCase();
}

/**
 * Renders markdown content with syntax highlighting for code blocks.
 * 
 * Features:
 * - GitHub Flavored Markdown (tables, strikethrough, task lists, autolinks)
 * - Syntax highlighting with Prism (adapts to light/dark theme)
 * - Copy button on code blocks
 * - Line numbers for longer code blocks
 * - Styled prose with proper spacing and typography
 */
export function MarkdownRenderer({ 
  content, 
  className = '',
  showLineNumbers = 'auto'
}: MarkdownRendererProps) {
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
          // Code blocks with syntax highlighting, copy button, and line numbers
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

            const language = match?.[1] || 'text';
            const lineCount = code.split('\n').length;
            
            // Show line numbers based on prop: always, never, or auto (>5 lines)
            const shouldShowLineNumbers = 
              showLineNumbers === true || 
              (showLineNumbers === 'auto' && lineCount > 5);

            return (
              <div className="relative group my-4 rounded-lg overflow-hidden border border-[var(--border)]">
                {/* Code block header with language and copy button */}
                <div className="flex items-center justify-between px-4 py-2 bg-[var(--muted)] border-b border-[var(--border)] text-xs text-[var(--muted-foreground)]">
                  <span className="font-medium">{getLanguageDisplayName(language)}</span>
                  <CopyButton code={code} />
                </div>
                
                {/* Syntax highlighted code */}
                <SyntaxHighlighter
                  style={codeStyle}
                  language={language}
                  PreTag="div"
                  showLineNumbers={shouldShowLineNumbers}
                  lineNumberStyle={{
                    minWidth: '2.5em',
                    paddingRight: '1em',
                    color: 'var(--muted-foreground)',
                    opacity: 0.5,
                    userSelect: 'none',
                  }}
                  customStyle={{
                    margin: 0,
                    borderRadius: 0,
                    fontSize: '0.875rem',
                    background: 'transparent',
                  }}
                  codeTagProps={{
                    style: {
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    },
                  }}
                >
                  {code}
                </SyntaxHighlighter>
              </div>
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

import Link from 'next/link';

/**
 * Landing page with hero section, value proposition, and call-to-action.
 *
 * Showcases what Markhub offers:
 * - Share markdown files (SOUL.md, AGENTS.md, prompts, etc.)
 * - Discover community content
 * - Version control for AI agent instructions
 */
export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 blur-3xl">
            <div
              className="aspect-[1155/678] w-[72rem] bg-gradient-to-tr from-[var(--accent)] to-[var(--primary)] opacity-20"
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
            />
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-1.5 text-sm">
              <span className="mr-2">🚀</span>
              <span className="text-[var(--muted-foreground)]">
                The home for agent markdown files
              </span>
            </div>

            {/* Headline */}
            <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Share your{' '}
              <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] bg-clip-text text-transparent">
                markdown
              </span>{' '}
              with the world
            </h1>

            {/* Subtitle */}
            <p className="mt-6 max-w-2xl text-lg text-[var(--muted-foreground)] sm:text-xl">
              A GitHub-like platform for sharing SOUL.md files, agent instructions, system prompts,
              and all the markdown that powers your AI workflows.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/api/auth/signin"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-8 text-base font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
              >
                <GitHubIcon className="h-5 w-5" />
                Sign in with GitHub
              </Link>
              <Link
                href="/explore"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-8 text-base font-medium transition-colors hover:bg-[var(--secondary)]"
              >
                Explore files
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="border-t border-[var(--border)] bg-[var(--card)] py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built for the AI agent era
            </h2>
            <p className="mt-4 text-lg text-[var(--muted-foreground)]">
              Everything you need to share, discover, and manage markdown files.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--accent)]/10">
                <FileIcon className="h-6 w-6 text-[var(--accent)]" />
              </div>
              <h3 className="text-lg font-semibold">Share Any Markdown</h3>
              <p className="mt-2 text-[var(--muted-foreground)]">
                SOUL.md, AGENTS.md, system prompts, README files, documentation — if it&apos;s
                markdown, it belongs here.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--accent)]/10">
                <SearchIcon className="h-6 w-6 text-[var(--accent)]" />
              </div>
              <h3 className="text-lg font-semibold">Discover & Learn</h3>
              <p className="mt-2 text-[var(--muted-foreground)]">
                Browse community files to find inspiration, learn patterns, and see how others
                structure their agent instructions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--accent)]/10">
                <StarIcon className="h-6 w-6 text-[var(--accent)]" />
              </div>
              <h3 className="text-lg font-semibold">Star & Comment</h3>
              <p className="mt-2 text-[var(--muted-foreground)]">
                Show appreciation for great files. Leave feedback and suggestions. Build a
                community around markdown.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--accent)]/10">
                <HistoryIcon className="h-6 w-6 text-[var(--accent)]" />
              </div>
              <h3 className="text-lg font-semibold">Version History</h3>
              <p className="mt-2 text-[var(--muted-foreground)]">
                Track changes over time. See how files evolve. Roll back when needed. Your markdown
                deserves version control.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--accent)]/10">
                <LockIcon className="h-6 w-6 text-[var(--accent)]" />
              </div>
              <h3 className="text-lg font-semibold">Public or Private</h3>
              <p className="mt-2 text-[var(--muted-foreground)]">
                Share openly with the community or keep files private. Control who sees your
                markdown.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--accent)]/10">
                <TerminalIcon className="h-6 w-6 text-[var(--accent)]" />
              </div>
              <h3 className="text-lg font-semibold">CLI Integration</h3>
              <p className="mt-2 text-[var(--muted-foreground)]">
                Push and pull files from your terminal. Integrate with your existing workflows.
                Built for developers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Perfect for</h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <UseCaseCard
              emoji="🤖"
              title="AI Agent Authors"
              description="Share SOUL.md and AGENTS.md files that define agent personalities and behaviors"
            />
            <UseCaseCard
              emoji="📝"
              title="Prompt Engineers"
              description="Publish and version system prompts, instruction sets, and templates"
            />
            <UseCaseCard
              emoji="📚"
              title="Documentation Writers"
              description="Store README files, guides, and reference docs in one place"
            />
            <UseCaseCard
              emoji="🔧"
              title="Tool Builders"
              description="Share SKILL.md and tool documentation for AI integrations"
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-[var(--border)] bg-[var(--card)] py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to share?</h2>
          <p className="mt-4 text-lg text-[var(--muted-foreground)]">
            Join the community and start sharing your markdown files today.
          </p>
          <div className="mt-8">
            <Link
              href="/api/auth/signin"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-8 text-base font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
            >
              <GitHubIcon className="h-5 w-5" />
              Get started with GitHub
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * Use case card component.
 */
function UseCaseCard({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-center">
      <div className="mb-4 text-4xl">{emoji}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">{description}</p>
    </div>
  );
}

/**
 * Icon components.
 */
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function TerminalIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

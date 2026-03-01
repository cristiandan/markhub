import { ThemeToggle } from '@/components/theme';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      {/* Header with theme toggle */}
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <h1 className="text-xl font-bold text-foreground">Markhub</h1>
        <ThemeToggle />
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Share and discover markdown files
          </h2>
          <p className="max-w-md text-lg text-muted-foreground">
            A GitHub-like platform for sharing agent instructions, SOUL.md files, prompts, and
            other markdown content.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <a
            href="/api/auth/signin"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sign in with GitHub
          </a>
          <a
            href="https://github.com/cristiandan/markhub"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-8 text-sm font-medium text-card-foreground transition-colors hover:bg-secondary"
          >
            View on GitHub
          </a>
        </div>

        {/* Theme demo section */}
        <div className="mt-8 rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-card-foreground">Theme Demo</h3>
          <p className="mb-4 text-muted-foreground">
            Click the toggle button in the header to switch between light, dark, and system themes.
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div className="rounded-md bg-primary p-3 text-primary-foreground">Primary</div>
            <div className="rounded-md bg-secondary p-3 text-secondary-foreground">Secondary</div>
            <div className="rounded-md bg-accent p-3 text-accent-foreground">Accent</div>
            <div className="rounded-md bg-muted p-3 text-muted-foreground">Muted</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-4 text-center text-sm text-muted-foreground">
        <p>Markhub — Share your markdown with the world</p>
      </footer>
    </div>
  );
}

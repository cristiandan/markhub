import Link from 'next/link';

/**
 * Footer component with navigation links and copyright.
 *
 * Displays:
 * - Navigation links (About, GitHub, Docs)
 * - Copyright notice with current year
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          {/* Navigation links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <Link
              href="/about"
              className="text-[var(--foreground)]/70 hover:text-[var(--foreground)] transition-colors"
            >
              About
            </Link>
            <Link
              href="/docs"
              className="text-[var(--foreground)]/70 hover:text-[var(--foreground)] transition-colors"
            >
              Docs
            </Link>
            <a
              href="https://github.com/cristiandan/markhub"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--foreground)]/70 hover:text-[var(--foreground)] transition-colors inline-flex items-center gap-1"
            >
              GitHub
              <ExternalLinkIcon className="h-3 w-3" />
            </a>
            <Link
              href="/privacy"
              className="text-[var(--foreground)]/70 hover:text-[var(--foreground)] transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-[var(--foreground)]/70 hover:text-[var(--foreground)] transition-colors"
            >
              Terms
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-[var(--foreground)]/50">
            © {currentYear} Markhub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

/**
 * External link icon for outbound links.
 */
function ExternalLinkIcon({ className }: { className?: string }) {
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
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

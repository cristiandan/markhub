'use client';

/**
 * Global error boundary for the root layout.
 * This catches errors that occur in the root layout itself,
 * which the regular error.tsx cannot handle.
 * 
 * Note: This must render its own <html> and <body> tags
 * because the root layout has errored.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ 
        margin: 0,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#0f0f1a',
        color: '#ffffff',
      }}>
        <div style={{ 
          textAlign: 'center',
          padding: '2rem',
          maxWidth: '32rem',
        }}>
          <div style={{
            width: '6rem',
            height: '6rem',
            margin: '0 auto 1.5rem',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: '3rem', height: '3rem' }}
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
          </div>
          <h1 style={{ 
            fontSize: '1.875rem',
            fontWeight: 700,
            margin: '0 0 0.75rem',
          }}>
            Critical Error
          </h1>
          <p style={{ 
            color: '#9ca3af',
            margin: '0 0 0.5rem',
            lineHeight: 1.6,
          }}>
            A critical error occurred while loading the application.
            Please try refreshing the page.
          </p>
          {error.digest && (
            <p style={{ 
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              color: '#6b7280',
              margin: '0 0 2rem',
            }}>
              Error ID: {error.digest}
            </p>
          )}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={reset}
              style={{
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                padding: '0.625rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
            <a
              href="/"
              style={{
                backgroundColor: 'transparent',
                color: '#ffffff',
                padding: '0.625rem 1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #374151',
                fontWeight: 500,
                fontSize: '0.875rem',
                textDecoration: 'none',
              }}
            >
              Go Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}

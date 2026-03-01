import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

/**
 * Settings page - placeholder for user profile and account settings.
 *
 * Features (planned):
 * - Edit profile (username, bio, avatar)
 * - Notification preferences
 * - Connected accounts
 * - Danger zone (delete account)
 */
export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/api/auth/signin');
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-[var(--muted-foreground)]">
          Manage your account and preferences
        </p>
      </div>

      {/* Settings sections */}
      <div className="space-y-8">
        {/* Profile Section */}
        <SettingsSection
          title="Profile"
          description="Your public profile information"
        >
          <div className="flex items-center gap-4">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session.user.name ?? 'Avatar'}
                className="h-16 w-16 rounded-full"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--muted)]">
                <UserIcon className="h-8 w-8 text-[var(--muted-foreground)]" />
              </div>
            )}
            <div>
              <p className="font-medium">{session.user.name ?? 'No name set'}</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {session.user.email}
              </p>
            </div>
          </div>
          <PlaceholderNotice message="Profile editing coming soon" />
        </SettingsSection>

        {/* Account Section */}
        <SettingsSection
          title="Account"
          description="Manage your account settings"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="flex items-center gap-3">
                <GitHubIcon className="h-5 w-5" />
                <div>
                  <p className="font-medium">GitHub</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Connected via OAuth
                  </p>
                </div>
              </div>
              <span className="text-sm text-green-600 dark:text-green-400">
                Connected
              </span>
            </div>
          </div>
          <PlaceholderNotice message="Account management coming soon" />
        </SettingsSection>

        {/* Notifications Section */}
        <SettingsSection
          title="Notifications"
          description="Configure how you receive updates"
        >
          <PlaceholderNotice message="Notification settings coming soon" />
        </SettingsSection>

        {/* Danger Zone */}
        <SettingsSection
          title="Danger Zone"
          description="Irreversible actions"
          variant="danger"
        >
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-red-700 dark:text-red-400">
                  Delete Account
                </p>
                <p className="text-sm text-red-600/80 dark:text-red-400/80">
                  Permanently delete your account and all files
                </p>
              </div>
              <button
                disabled
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white opacity-50 cursor-not-allowed"
              >
                Delete Account
              </button>
            </div>
          </div>
        </SettingsSection>
      </div>

      {/* Back link */}
      <div className="mt-8 border-t border-[var(--border)] pt-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

/**
 * Settings section container with title and description.
 */
function SettingsSection({
  title,
  description,
  variant = 'default',
  children,
}: {
  title: string;
  description: string;
  variant?: 'default' | 'danger';
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
      <div
        className={`border-b px-6 py-4 ${
          variant === 'danger'
            ? 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/10'
            : 'border-[var(--border)]'
        }`}
      >
        <h2
          className={`text-lg font-semibold ${
            variant === 'danger' ? 'text-red-700 dark:text-red-400' : ''
          }`}
        >
          {title}
        </h2>
        <p
          className={`text-sm ${
            variant === 'danger'
              ? 'text-red-600/80 dark:text-red-400/80'
              : 'text-[var(--muted-foreground)]'
          }`}
        >
          {description}
        </p>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </section>
  );
}

/**
 * Placeholder notice for unimplemented features.
 */
function PlaceholderNotice({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-[var(--muted)] px-4 py-3 text-sm text-[var(--muted-foreground)]">
      <WrenchIcon className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

// =============================================================================
// ICONS
// =============================================================================

function UserIcon({ className }: { className?: string }) {
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
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function WrenchIcon({ className }: { className?: string }) {
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
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
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
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

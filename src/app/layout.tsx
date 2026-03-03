import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { SessionProvider } from '@/components/auth/SessionProvider';
import { ThemeProvider } from '@/components/theme';
import { Header, Footer } from '@/components/layout';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://markhub.md';

export const metadata: Metadata = {
  title: {
    default: 'Markhub',
    template: '%s | Markhub',
  },
  description: 'Share and discover markdown files. The GitHub for agent configs, prompt libraries, and documentation.',
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: 'Markhub',
    description: 'Share and discover markdown files. The GitHub for agent configs, prompt libraries, and documentation.',
    url: siteUrl,
    siteName: 'Markhub',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Markhub',
    description: 'Share and discover markdown files. The GitHub for agent configs, prompt libraries, and documentation.',
    creator: '@markhubmd',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning required by next-themes to prevent
    // hydration mismatch when theme is loaded from localStorage
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <ThemeProvider>
          <SessionProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

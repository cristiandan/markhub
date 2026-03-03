import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore',
  description: 'Discover trending markdown files, search for agent configs, prompts, and documentation shared by the community.',
  openGraph: {
    title: 'Explore Markhub',
    description: 'Discover trending markdown files, search for agent configs, prompts, and documentation shared by the community.',
    url: 'https://markhub.md/explore',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Explore Markhub',
    description: 'Discover trending markdown files, search for agent configs, prompts, and documentation shared by the community.',
  },
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

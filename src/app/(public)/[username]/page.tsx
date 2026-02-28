interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold">@{username}</h1>
      <p className="text-muted-foreground mt-2">
        User profile page. Coming soon.
      </p>
    </div>
  );
}

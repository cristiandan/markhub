import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * Raw markdown view API endpoint.
 *
 * Returns the raw markdown content as plain text.
 *
 * GET /api/raw/{username}/{path}
 *
 * Visibility rules:
 * - PUBLIC: Visible to everyone
 * - UNLISTED: Visible to everyone (via direct link)
 * - PRIVATE: Only visible to owner
 */

interface RouteParams {
  params: Promise<{
    username: string;
    path: string[];
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { username, path: pathSegments } = await params;
  const filePath = pathSegments.join('/');

  // Look up the user
  const user = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
    },
  });

  if (!user) {
    return new NextResponse('Not found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  // Look up the file
  const file = await db.file.findUnique({
    where: {
      userId_path: {
        userId: user.id,
        path: filePath,
      },
    },
    select: {
      path: true,
      content: true,
      visibility: true,
    },
  });

  if (!file) {
    return new NextResponse('Not found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  // Check visibility
  if (file.visibility === 'PRIVATE') {
    const session = await auth();
    if (!session?.user?.id || session.user.id !== user.id) {
      return new NextResponse('Not found', {
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
  }

  // Extract filename for Content-Disposition header
  const filename = file.path.split('/').pop() || 'file.md';

  // Return raw markdown content
  return new NextResponse(file.content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `inline; filename="${filename}"`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=60, s-maxage=60',
    },
  });
}

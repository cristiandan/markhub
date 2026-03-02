/**
 * API route for starring/unstarring files.
 *
 * POST /api/files/[id]/star - Toggle star on a file
 *
 * Returns the new star state and updated star count.
 * Requires authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { extractBearerToken, verifyCliToken } from '@/lib/cli-token';

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Authenticate request from either session (web) or Bearer token (CLI).
 * Returns user ID or null if not authenticated.
 */
async function authenticateRequest(request: NextRequest): Promise<string | null> {
  // Try Bearer token first (CLI)
  const authHeader = request.headers.get('Authorization');
  const bearerToken = extractBearerToken(authHeader);
  if (bearerToken) {
    const userId = await verifyCliToken(bearerToken);
    return userId;
  }

  // Fall back to session (web)
  const session = await auth();
  return session?.user?.id ?? null;
}

// =============================================================================
// POST /api/files/[id]/star - Toggle star
// =============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: fileId } = await params;
    const userId = await authenticateRequest(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the file
    const file = await db.file.findUnique({
      where: { id: fileId },
      select: {
        id: true,
        visibility: true,
        userId: true,
        starCount: true,
      },
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Check visibility - can't star private files unless you're the owner
    if (file.visibility === 'PRIVATE' && file.userId !== userId) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Check if already starred
    const existingStar = await db.star.findUnique({
      where: {
        userId_fileId: {
          userId,
          fileId,
        },
      },
    });

    let starred: boolean;
    let newStarCount: number;

    if (existingStar) {
      // Remove star
      await db.$transaction([
        db.star.delete({
          where: {
            userId_fileId: {
              userId,
              fileId,
            },
          },
        }),
        db.file.update({
          where: { id: fileId },
          data: { starCount: { decrement: 1 } },
        }),
      ]);
      starred = false;
      newStarCount = Math.max(0, file.starCount - 1);
    } else {
      // Add star
      await db.$transaction([
        db.star.create({
          data: {
            userId,
            fileId,
          },
        }),
        db.file.update({
          where: { id: fileId },
          data: { starCount: { increment: 1 } },
        }),
      ]);
      starred = true;
      newStarCount = file.starCount + 1;
    }

    return NextResponse.json({
      starred,
      starCount: newStarCount,
    });
  } catch (error) {
    console.error('POST /api/files/[id]/star error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================================================
// GET /api/files/[id]/star - Check star status
// =============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: fileId } = await params;
    const userId = await authenticateRequest(request);

    // Find the file
    const file = await db.file.findUnique({
      where: { id: fileId },
      select: {
        id: true,
        visibility: true,
        userId: true,
        starCount: true,
      },
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Check visibility
    if (file.visibility === 'PRIVATE' && file.userId !== userId) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Check if user has starred (if authenticated)
    let starred = false;
    if (userId) {
      const existingStar = await db.star.findUnique({
        where: {
          userId_fileId: {
            userId,
            fileId,
          },
        },
      });
      starred = !!existingStar;
    }

    return NextResponse.json({
      starred,
      starCount: file.starCount,
    });
  } catch (error) {
    console.error('GET /api/files/[id]/star error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

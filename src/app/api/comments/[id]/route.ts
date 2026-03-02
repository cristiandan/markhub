/**
 * API route for individual comments.
 *
 * DELETE /api/comments/[id] - Delete a comment (owner only)
 *
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
// DELETE /api/comments/[id] - Delete comment
// =============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commentId } = await params;
    const userId = await authenticateRequest(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the comment
    const comment = await db.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Only the comment owner can delete it
    if (comment.userId !== userId) {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 }
      );
    }

    // Delete the comment
    await db.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/comments/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

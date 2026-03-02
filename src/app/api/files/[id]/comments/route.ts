/**
 * API route for file comments.
 *
 * POST /api/files/[id]/comments - Create a new comment
 * GET /api/files/[id]/comments - List comments on a file
 *
 * Requires authentication for POST.
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

/**
 * Validate comment content.
 * Returns error message if invalid, null if valid.
 */
function validateContent(content: unknown): string | null {
  if (!content || typeof content !== 'string') {
    return 'Content is required';
  }

  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return 'Content cannot be empty';
  }

  if (trimmed.length > 10000) {
    return 'Content must be less than 10,000 characters';
  }

  return null;
}

// =============================================================================
// POST /api/files/[id]/comments - Create comment
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

    // Parse request body
    let body: { content?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // Validate content
    const contentError = validateContent(body.content);
    if (contentError) {
      return NextResponse.json({ error: contentError }, { status: 400 });
    }

    const content = body.content!.trim();

    // Find the file
    const file = await db.file.findUnique({
      where: { id: fileId },
      select: {
        id: true,
        visibility: true,
        userId: true,
      },
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Check visibility - can't comment on private files unless you're the owner
    if (file.visibility === 'PRIVATE' && file.userId !== userId) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Create the comment
    const comment = await db.comment.create({
      data: {
        userId,
        fileId,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        author: {
          id: comment.user.id,
          username: comment.user.username,
          name: comment.user.name,
          avatar: comment.user.avatar,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/files/[id]/comments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================================================
// GET /api/files/[id]/comments - List comments
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
      },
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Check visibility - can't see comments on private files unless you're the owner
    if (file.visibility === 'PRIVATE' && file.userId !== userId) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Parse pagination params
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') ?? '50', 10) || 50, 1), 100);
    const cursor = searchParams.get('cursor') ?? undefined;

    // Fetch comments
    const comments = await db.comment.findMany({
      where: { fileId },
      orderBy: { createdAt: 'asc' },
      take: limit + 1, // Fetch one extra to check if there are more
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1, // Skip the cursor item
      }),
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Check if there are more results
    const hasMore = comments.length > limit;
    const results = hasMore ? comments.slice(0, -1) : comments;
    const nextCursor = hasMore ? results[results.length - 1]?.id : undefined;

    return NextResponse.json({
      comments: results.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        author: {
          id: comment.user.id,
          username: comment.user.username,
          name: comment.user.name,
          avatar: comment.user.avatar,
        },
      })),
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error('GET /api/files/[id]/comments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

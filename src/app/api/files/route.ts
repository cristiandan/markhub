/**
 * API route for file operations.
 *
 * POST /api/files - Create a new file
 * Requires authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Visibility } from '@prisma/client';

// =============================================================================
// TYPES
// =============================================================================

interface CreateFileBody {
  path: string;
  content: string;
  visibility?: Visibility;
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validate file path.
 * Rules:
 * - Must end with .md
 * - Cannot start with / or .
 * - Cannot contain consecutive slashes
 * - Cannot contain .. (path traversal)
 * - Max length 256 characters
 */
function validatePath(path: string): { valid: boolean; error?: string } {
  if (!path || typeof path !== 'string') {
    return { valid: false, error: 'Path is required' };
  }

  const trimmed = path.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Path is required' };
  }

  if (trimmed.length > 256) {
    return { valid: false, error: 'Path must be 256 characters or less' };
  }

  if (!trimmed.endsWith('.md')) {
    return { valid: false, error: 'Path must end with .md' };
  }

  if (trimmed.startsWith('/') || trimmed.startsWith('.')) {
    return { valid: false, error: 'Path cannot start with / or .' };
  }

  if (trimmed.includes('//')) {
    return { valid: false, error: 'Path cannot contain consecutive slashes' };
  }

  if (trimmed.includes('..')) {
    return { valid: false, error: 'Path cannot contain ..' };
  }

  // Check for invalid characters
  const invalidChars = /[<>:"|?*\x00-\x1f]/;
  if (invalidChars.test(trimmed)) {
    return { valid: false, error: 'Path contains invalid characters' };
  }

  return { valid: true };
}

/**
 * Validate visibility value.
 */
function validateVisibility(visibility: unknown): visibility is Visibility {
  return (
    visibility === 'PUBLIC' ||
    visibility === 'UNLISTED' ||
    visibility === 'PRIVATE'
  );
}

// =============================================================================
// POST /api/files - Create a new file
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Parse request body
    let body: CreateFileBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { path, content, visibility = 'PUBLIC' } = body;

    // Validate path
    const pathValidation = validatePath(path);
    if (!pathValidation.valid) {
      return NextResponse.json(
        { error: pathValidation.error },
        { status: 400 }
      );
    }

    const normalizedPath = path.trim();

    // Validate content
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    if (content.length > 1_000_000) {
      // 1MB limit for markdown content
      return NextResponse.json(
        { error: 'Content exceeds maximum size (1MB)' },
        { status: 400 }
      );
    }

    // Validate visibility
    if (!validateVisibility(visibility)) {
      return NextResponse.json(
        { error: 'Invalid visibility. Must be PUBLIC, UNLISTED, or PRIVATE' },
        { status: 400 }
      );
    }

    // Check if file already exists for this user
    const existingFile = await db.file.findUnique({
      where: {
        userId_path: {
          userId,
          path: normalizedPath,
        },
      },
      select: { id: true },
    });

    if (existingFile) {
      return NextResponse.json(
        { error: 'A file with this path already exists' },
        { status: 409 }
      );
    }

    // Create the file
    const file = await db.file.create({
      data: {
        userId,
        path: normalizedPath,
        content,
        visibility,
      },
      select: {
        id: true,
        path: true,
        visibility: true,
        createdAt: true,
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        id: file.id,
        path: file.path,
        visibility: file.visibility,
        url: `/${file.user.username}/${file.path}`,
        createdAt: file.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/files error:', error);

    // Handle Prisma unique constraint error (race condition)
    if (
      error instanceof Error &&
      error.message.includes('Unique constraint')
    ) {
      return NextResponse.json(
        { error: 'A file with this path already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

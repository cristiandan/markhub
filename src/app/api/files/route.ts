/**
 * API route for file operations.
 *
 * POST /api/files - Create a new file
 * Requires authentication (session or Bearer token).
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Visibility } from '@prisma/client';
import { validateMarkdown, sanitizeMarkdown } from '@/lib/sanitize';
import { extractBearerToken, verifyCliToken } from '@/lib/cli-token';

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

/**
 * Authenticate a request via session or Bearer token.
 * Returns user ID if authenticated, null otherwise.
 */
async function authenticateRequest(request: NextRequest): Promise<string | null> {
  // First, try Bearer token (CLI)
  const authHeader = request.headers.get('Authorization');
  const token = extractBearerToken(authHeader);
  
  if (token) {
    const userId = await verifyCliToken(token);
    if (userId) {
      return userId;
    }
  }
  
  // Fall back to session auth (web)
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user (session or Bearer token)
    const userId = await authenticateRequest(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    // Validate content using markdown validation
    const contentValidation = validateMarkdown(content);
    if (!contentValidation.valid) {
      return NextResponse.json(
        { error: contentValidation.error },
        { status: 400 }
      );
    }

    // Sanitize content to prevent XSS
    const sanitizedContent = sanitizeMarkdown(content);

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

    // Create the file with sanitized content
    const file = await db.file.create({
      data: {
        userId,
        path: normalizedPath,
        content: sanitizedContent,
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

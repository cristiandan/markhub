/**
 * API route for individual file operations.
 *
 * GET /api/files/[id] - Get file by ID
 * PATCH /api/files/[id] - Update file
 * DELETE /api/files/[id] - Delete file
 *
 * All operations require authentication and ownership.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Visibility } from '@prisma/client';
import { validateMarkdown, sanitizeMarkdown } from '@/lib/sanitize';

// =============================================================================
// TYPES
// =============================================================================

interface UpdateFileBody {
  content?: string;
  visibility?: Visibility;
}

// =============================================================================
// VALIDATION
// =============================================================================

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
// GET /api/files/[id] - Get file by ID
// =============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const file = await db.file.findUnique({
      where: { id },
      select: {
        id: true,
        path: true,
        content: true,
        visibility: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Only owner can access via this API
    if (file.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(file);
  } catch (error) {
    console.error('GET /api/files/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================================================
// PATCH /api/files/[id] - Update file
// =============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check file exists and user owns it
    const existingFile = await db.file.findUnique({
      where: { id },
      select: { id: true, userId: true, path: true },
    });

    if (!existingFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    if (existingFile.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    let body: UpdateFileBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { content, visibility } = body;

    // Build update data
    const updateData: { content?: string; visibility?: Visibility } = {};

    // Validate and sanitize content if provided
    if (content !== undefined) {
      const contentValidation = validateMarkdown(content);
      if (!contentValidation.valid) {
        return NextResponse.json(
          { error: contentValidation.error },
          { status: 400 }
        );
      }
      updateData.content = sanitizeMarkdown(content);
    }

    // Validate visibility if provided
    if (visibility !== undefined) {
      if (!validateVisibility(visibility)) {
        return NextResponse.json(
          { error: 'Invalid visibility. Must be PUBLIC, UNLISTED, or PRIVATE' },
          { status: 400 }
        );
      }
      updateData.visibility = visibility;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Update the file
    const updatedFile = await db.file.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        path: true,
        visibility: true,
        updatedAt: true,
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: updatedFile.id,
      path: updatedFile.path,
      visibility: updatedFile.visibility,
      url: `/${updatedFile.user.username}/${updatedFile.path}`,
      updatedAt: updatedFile.updatedAt,
    });
  } catch (error) {
    console.error('PATCH /api/files/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================================================
// DELETE /api/files/[id] - Delete file
// =============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check file exists and user owns it
    const existingFile = await db.file.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!existingFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    if (existingFile.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete the file (cascade deletes stars and comments via Prisma schema)
    await db.file.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/files/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

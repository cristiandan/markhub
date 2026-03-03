import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/recent
 *
 * Returns recently uploaded public files ordered by createdAt descending.
 *
 * Query parameters:
 * - limit: number of files to return (default 10, max 50)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse limit parameter
    const limitParam = searchParams.get('limit');
    const limit = Math.min(Math.max(parseInt(limitParam || '10', 10) || 10, 1), 50);

    // Fetch recent public files
    const files = await db.file.findMany({
      where: {
        visibility: 'PUBLIC',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      select: {
        id: true,
        path: true,
        starCount: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            username: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({
      files,
      count: files.length,
    });
  } catch (error) {
    console.error('Recent files error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent files' },
      { status: 500 }
    );
  }
}

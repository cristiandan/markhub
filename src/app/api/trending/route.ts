import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/trending
 *
 * Returns trending/popular public files sorted by star count.
 * Used for the explore page's trending section.
 *
 * Query params:
 * - limit: Number of files to return (default: 10, max: 50)
 * - period: Time period to consider (default: all)
 *           - "week": Files created in the last 7 days
 *           - "month": Files created in the last 30 days
 *           - "all": All time
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const period = searchParams.get('period') || 'all';

    // Parse and validate limit
    let limit = 10;
    if (limitParam) {
      const parsed = parseInt(limitParam, 10);
      if (!isNaN(parsed) && parsed > 0) {
        limit = Math.min(parsed, 50);
      }
    }

    // Build date filter based on period
    let dateFilter: Date | undefined;
    if (period === 'week') {
      dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Fetch trending files
    const files = await db.file.findMany({
      where: {
        visibility: 'PUBLIC',
        ...(dateFilter && { createdAt: { gte: dateFilter } }),
      },
      orderBy: [
        { starCount: 'desc' },
        { createdAt: 'desc' }, // Secondary sort by recency
      ],
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
      period,
      count: files.length,
    });
  } catch (error) {
    console.error('Trending API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending files' },
      { status: 500 }
    );
  }
}

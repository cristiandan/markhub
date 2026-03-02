/**
 * Search API endpoint
 * GET /api/search?q=query&limit=20&offset=0
 * 
 * Searches PUBLIC files using PostgreSQL full-text search (tsvector).
 * Returns files ranked by relevance with highlighted snippets.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface SearchResult {
  id: string;
  path: string;
  visibility: string;
  starCount: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    username: string;
    name: string | null;
    avatar: string | null;
  };
  headline: string;
  rank: number;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  if (!query || query.trim().length === 0) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400 }
    );
  }

  if (query.length > 200) {
    return NextResponse.json(
      { error: 'Query too long (max 200 characters)' },
      { status: 400 }
    );
  }

  try {
    // Convert user query to tsquery format
    // Split into words, filter empty, and join with & for AND search
    const sanitizedQuery = query
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0)
      .map((word) => word.replace(/[^\w]/g, '')) // Remove special chars
      .filter((word) => word.length > 0)
      .join(' & ');

    if (!sanitizedQuery) {
      return NextResponse.json({ files: [], total: 0 });
    }

    // Execute full-text search using raw SQL for tsvector operations
    const results = await db.$queryRaw<SearchResult[]>`
      SELECT 
        f.id,
        f.path,
        f.visibility,
        f."starCount",
        f."createdAt",
        f."updatedAt",
        json_build_object(
          'username', u.username,
          'name', u.name,
          'avatar', u.avatar
        ) as user,
        ts_headline(
          'english',
          f.content,
          to_tsquery('english', ${sanitizedQuery}),
          'StartSel=<mark>, StopSel=</mark>, MaxWords=50, MinWords=20, MaxFragments=2'
        ) as headline,
        ts_rank(f."searchVector", to_tsquery('english', ${sanitizedQuery})) as rank
      FROM "File" f
      JOIN "User" u ON f."userId" = u.id
      WHERE 
        f.visibility = 'PUBLIC'
        AND f."searchVector" @@ to_tsquery('english', ${sanitizedQuery})
      ORDER BY rank DESC, f."starCount" DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    // Get total count for pagination
    const countResult = await db.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count
      FROM "File" f
      WHERE 
        f.visibility = 'PUBLIC'
        AND f."searchVector" @@ to_tsquery('english', ${sanitizedQuery})
    `;

    const total = Number(countResult[0]?.count ?? 0);

    // Convert BigInt to Number for JSON serialization
    const files = results.map((r) => ({
      ...r,
      rank: Number(r.rank),
    }));

    return NextResponse.json({
      files,
      total,
      query: query.trim(),
      limit,
      offset,
    });
  } catch (error) {
    console.error('Search error:', error);
    
    // Handle invalid tsquery syntax gracefully
    if (error instanceof Error && error.message.includes('syntax error')) {
      return NextResponse.json({ files: [], total: 0 });
    }

    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}

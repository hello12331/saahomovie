import { NextResponse } from 'next/server';
const { query, queryOne, execute } = require('@/lib/db');

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let sql = `SELECT * FROM Movie WHERE isPublished = 1`;
    const params: any[] = [];

    if (search) {
      sql += ` AND (title LIKE ? OR genre LIKE ? OR cast LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY rating DESC`;
    const movies = await query(sql, params);

    // Parse JSON fields
    const parsedMovies = movies.map((m: any) => ({
      ...m,
      cast: JSON.parse(m.cast || '[]'),
      crew: JSON.parse(m.crew || '[]'),
      isTrending: Boolean(m.isTrending),
      isUpcoming: Boolean(m.isUpcoming),
      isPublished: Boolean(m.isPublished)
    }));

    return NextResponse.json({ success: true, movies: parsedMovies });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

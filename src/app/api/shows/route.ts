import { NextResponse } from 'next/server';
const { query, queryOne } = require('@/lib/db');

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get('movieId');
    const city = searchParams.get('city') || 'Hyderabad';
    const date = searchParams.get('date');

    let sql = `
      SELECT s.*, c.name as cinemaName, c.address as cinemaAddress, c.facilities as cinemaFacilities, c.city as cinemaCity, sc.name as screenName, sc.screenType
      FROM Show s
      JOIN Cinema c ON s.cinemaId = c.id
      JOIN Screen sc ON s.screenId = sc.id
      WHERE c.city = ?
    `;
    const params: any[] = [city];

    if (movieId) {
      sql += ` AND s.movieId = ?`;
      params.push(movieId);
    }

    sql += ` ORDER BY c.name ASC, s.startTime ASC`;

    const shows = await query(sql, params);

    const parsedShows = shows.map((s: any) => ({
      ...s,
      cinemaFacilities: JSON.parse(s.cinemaFacilities || '[]')
    }));

    return NextResponse.json({ success: true, shows: parsedShows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

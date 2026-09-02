import { NextResponse } from 'next/server';
const { query } = require('@/lib/db');

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'u_demo';

    const bookings = await query(`
      SELECT b.*, 
             m.title as movieTitle, m.poster as moviePoster,
             c.name as cinemaName, c.city as cinemaCity,
             s.startTime, s.endTime, s.format,
             e.title as eventTitle, e.banner as eventBanner, e.venue as eventVenue, e.eventDate
      FROM Booking b
      LEFT JOIN Show s ON b.showId = s.id
      LEFT JOIN Movie m ON s.movieId = m.id
      LEFT JOIN Cinema c ON s.cinemaId = c.id
      LEFT JOIN Event e ON b.eventId = e.id
      WHERE b.userId = ?
      ORDER BY b.createdAt DESC
    `, [userId]);

    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

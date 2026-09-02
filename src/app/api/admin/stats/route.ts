import { NextResponse } from 'next/server';
const { query, queryOne, execute } = require('@/lib/db');

export async function GET(request: Request) {
  try {
    const totalUsers = await queryOne(`SELECT COUNT(*) as count FROM User`);
    const totalBookings = await queryOne(`SELECT COUNT(*) as count FROM Booking`);
    const totalRevenue = await queryOne(`SELECT SUM(totalAmount) as sum FROM Booking WHERE status = 'CONFIRMED'`);
    const activeMovies = await queryOne(`SELECT COUNT(*) as count FROM Movie WHERE isPublished = 1`);
    const activeEvents = await queryOne(`SELECT COUNT(*) as count FROM Event WHERE isPublished = 1`);
    const activeCinemas = await queryOne(`SELECT COUNT(*) as count FROM Cinema`);

    const recentBookings = await query(`
      SELECT b.*, u.name as userName, m.title as movieTitle, e.title as eventTitle
      FROM Booking b
      JOIN User u ON b.userId = u.id
      LEFT JOIN Show s ON b.showId = s.id
      LEFT JOIN Movie m ON s.movieId = m.id
      LEFT JOIN Event e ON b.eventId = e.id
      ORDER BY b.createdAt DESC LIMIT 10
    `);

    const moviesList = await query(`SELECT * FROM Movie ORDER BY createdAt DESC`);
    const cinemasList = await query(`SELECT * FROM Cinema ORDER BY name ASC`);
    const eventsList = await query(`SELECT * FROM Event ORDER BY eventDate ASC`);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: totalUsers.count,
        totalBookings: totalBookings.count,
        revenue: totalRevenue.sum || 0,
        activeMovies: activeMovies.count,
        activeEvents: activeEvents.count,
        activeCinemas: activeCinemas.count,
        occupancyRate: "78.4%"
      },
      recentBookings,
      movies: moviesList,
      cinemas: cinemasList,
      events: eventsList
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

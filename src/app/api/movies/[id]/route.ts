import { NextResponse } from 'next/server';
const { query, queryOne } = require('@/lib/db');

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const movieId = params.id;
    const movie = await queryOne(`SELECT * FROM Movie WHERE id = ?`, [movieId]);

    if (!movie) {
      return NextResponse.json({ success: false, error: "Movie not found" }, { status: 404 });
    }

    const reviews = await query(`
      SELECT r.*, u.name as userName, u.avatar as userAvatar 
      FROM Review r 
      JOIN User u ON r.userId = u.id 
      WHERE r.movieId = ?
      ORDER BY r.createdAt DESC
    `, [movieId]);

    const parsedMovie = {
      ...movie,
      cast: JSON.parse(movie.cast || '[]'),
      crew: JSON.parse(movie.crew || '[]'),
      isTrending: Boolean(movie.isTrending),
      isUpcoming: Boolean(movie.isUpcoming)
    };

    return NextResponse.json({ success: true, movie: parsedMovie, reviews });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

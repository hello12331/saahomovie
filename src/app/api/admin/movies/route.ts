import { NextResponse } from 'next/server';
const { queryOne, execute } = require('@/lib/db');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, id, title, poster, backdrop, description, genre, language, durationMins, certification, releaseDate, cast, crew, trailerUrl } = body;

    if (action === 'DELETE') {
      await execute(`DELETE FROM Movie WHERE id = ?`, [id]);
      return NextResponse.json({ success: true, message: "Movie deleted successfully" });
    }

    if (action === 'UPDATE') {
      await execute(`
        UPDATE Movie 
        SET title = ?, poster = ?, backdrop = ?, description = ?, genre = ?, language = ?, durationMins = ?, certification = ?, trailerUrl = ?
        WHERE id = ?
      `, [title, poster, backdrop, description, genre, language, durationMins, certification, trailerUrl, id]);
      return NextResponse.json({ success: true, message: "Movie updated successfully" });
    }

    // CREATE
    const movieId = "m_" + Date.now();
    await execute(`
      INSERT INTO Movie (id, title, poster, backdrop, description, genre, language, durationMins, certification, releaseDate, cast, crew, trailerUrl, rating, ratingCount, isPublished, isTrending)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 4.5, 10, 1, 1)
    `, [
      movieId,
      title,
      poster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80",
      backdrop || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80",
      description,
      genre || "Action, Drama",
      language || "Telugu, English",
      Number(durationMins) || 150,
      certification || "U/A",
      releaseDate || new Date().toISOString(),
      JSON.stringify(cast ? cast.split(',') : ["Lead Actor"]),
      JSON.stringify([{ role: "Director", name: crew || "Famous Director" }]),
      trailerUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ"
    ]);

    return NextResponse.json({ success: true, movieId, message: "Movie created successfully!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

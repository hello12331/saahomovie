import { NextResponse } from 'next/server';
const { query, queryOne, execute } = require('@/lib/db');

export async function GET(request: Request, { params }: { params: { showId: string } }) {
  try {
    const showId = params.showId;
    const show = await queryOne(`
      SELECT s.*, m.title as movieTitle, m.poster as moviePoster, c.name as cinemaName, c.city as cinemaCity, sc.name as screenName
      FROM Show s
      JOIN Movie m ON s.movieId = m.id
      JOIN Cinema c ON s.cinemaId = c.id
      JOIN Screen sc ON s.screenId = sc.id
      WHERE s.id = ?
    `, [showId]);

    if (!show) {
      return NextResponse.json({ success: false, error: "Show not found" }, { status: 404 });
    }

    // Get all seats for the screen
    const seats = await query(`
      SELECT * FROM Seat WHERE screenId = ? ORDER BY rowLabel ASC, seatNumber ASC
    `, [show.screenId]);

    // Clean up expired locks first
    const nowIso = new Date().toISOString();
    await execute(`DELETE FROM SeatLock WHERE expiresAt < ?`, [nowIso]);

    // Get currently locked seat IDs for this show
    const locks = await query(`SELECT seatId, userId FROM SeatLock WHERE showId = ?`, [showId]);
    const lockedMap = new Map();
    locks.forEach((l: any) => lockedMap.set(l.seatId, l.userId));

    // Get currently booked seat IDs for this show
    const bookedSeats = await query(`
      SELECT bs.seatId 
      FROM BookingSeat bs
      JOIN Booking b ON bs.bookingId = b.id
      WHERE b.showId = ? AND b.status = 'CONFIRMED'
    `, [showId]);
    const bookedSet = new Set(bookedSeats.map((b: any) => b.seatId));

    const updatedSeats = seats.map((st: any) => {
      let status = "AVAILABLE";
      if (bookedSet.has(st.id)) {
        status = "BOOKED";
      } else if (lockedMap.has(st.id)) {
        status = "LOCKED";
      }

      return {
        ...st,
        status,
        lockedBy: lockedMap.get(st.id) || null
      };
    });

    return NextResponse.json({ success: true, show, seats: updatedSeats });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Lock / Unlock seats API
export async function POST(request: Request, { params }: { params: { showId: string } }) {
  try {
    const showId = params.showId;
    const body = await request.json();
    const { seatIds, userId = "u_demo", action = "LOCK" } = body;

    if (action === "LOCK") {
      // Check if any requested seat is already booked or locked by another user
      const nowIso = new Date().toISOString();
      await execute(`DELETE FROM SeatLock WHERE expiresAt < ?`, [nowIso]);

      for (const seatId of seatIds) {
        const isBooked = await queryOne(`
          SELECT bs.id FROM BookingSeat bs JOIN Booking b ON bs.bookingId = b.id
          WHERE b.showId = ? AND bs.seatId = ? AND b.status = 'CONFIRMED'
        `, [showId, seatId]);

        if (isBooked) {
          return NextResponse.json({ success: false, error: `Seat is already booked.` }, { status: 400 });
        }

        const isLocked = await queryOne(`
          SELECT * FROM SeatLock WHERE showId = ? AND seatId = ? AND userId != ?
        `, [showId, seatId, userId]);

        if (isLocked) {
          return NextResponse.json({ success: false, error: `Seat is currently being booked by another user.` }, { status: 400 });
        }
      }

      // Lock seats for 5 minutes
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      for (const seatId of seatIds) {
        await execute(`
          INSERT OR REPLACE INTO SeatLock (id, showId, seatId, userId, expiresAt)
          VALUES (?, ?, ?, ?, ?)
        `, [`lock_${showId}_${seatId}`, showId, seatId, userId, expiresAt]);
      }

      return NextResponse.json({ success: true, expiresAt });
    } else if (action === "UNLOCK") {
      for (const seatId of seatIds) {
        await execute(`DELETE FROM SeatLock WHERE showId = ? AND seatId = ? AND userId = ?`, [showId, seatId, userId]);
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

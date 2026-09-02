import { NextResponse } from 'next/server';
const { queryOne, execute } = require('@/lib/db');
import { sendEmail, generateBookingConfirmationHtml } from '@/lib/emailService';

export async function POST(request: Request) {
  try {
    const { bookingId } = await request.json();
    if (!bookingId) {
      return NextResponse.json({ success: false, error: "Booking ID is required." }, { status: 400 });
    }

    const booking = await queryOne(`
      SELECT b.*, u.email as userEmail, u.name as userName,
             m.title as movieTitle, c.name as cinemaName, e.title as eventTitle
      FROM Booking b
      JOIN User u ON b.userId = u.id
      LEFT JOIN Show s ON b.showId = s.id
      LEFT JOIN Movie m ON s.movieId = m.id
      LEFT JOIN Cinema c ON s.cinemaId = c.id
      LEFT JOIN Event e ON b.eventId = e.id
      WHERE b.id = ?
    `, [bookingId]);

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking record not found." }, { status: 404 });
    }

    const html = generateBookingConfirmationHtml(booking);

    const emailResult = await sendEmail({
      to: booking.userEmail,
      subject: `Booking Confirmed – ${booking.movieTitle || booking.eventTitle} | CineGo`,
      html,
      emailType: 'BOOKING_CONFIRMATION',
      userId: booking.userId,
      bookingId: booking.id
    });

    return NextResponse.json({
      success: true,
      message: `Booking confirmation email re-sent successfully to ${booking.userEmail}!`,
      logId: emailResult.logId
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

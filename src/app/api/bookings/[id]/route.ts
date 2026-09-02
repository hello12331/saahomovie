import { NextResponse } from 'next/server';
const { queryOne, execute } = require('@/lib/db');
import { sendEmail, generateCancellationHtml } from '@/lib/emailService';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const bookingId = params.id;
    const booking = await queryOne(`
      SELECT b.*, p.paymentMethod, p.transactionId, p.createdAt as paymentDate,
             m.title as movieTitle, m.poster as moviePoster, m.durationMins, m.certification, m.language as movieLanguage,
             c.name as cinemaName, c.address as cinemaAddress, c.city as cinemaCity,
             sc.name as screenName, sc.screenType,
             s.startTime, s.endTime, s.format,
             e.title as eventTitle, e.banner as eventBanner, e.venue as eventVenue, e.eventDate, e.startTime as eventStartTime
      FROM Booking b
      LEFT JOIN Payment p ON b.id = p.bookingId
      LEFT JOIN Show s ON b.showId = s.id
      LEFT JOIN Movie m ON s.movieId = m.id
      LEFT JOIN Cinema c ON s.cinemaId = c.id
      LEFT JOIN Screen sc ON s.screenId = sc.id
      LEFT JOIN Event e ON b.eventId = e.id
      WHERE b.id = ?
    `, [bookingId]);

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    const seats = await require('@/lib/db').query(`
      SELECT st.rowLabel, st.seatNumber, st.category, bs.price
      FROM BookingSeat bs
      JOIN Seat st ON bs.seatId = st.id
      WHERE bs.bookingId = ?
      ORDER BY st.rowLabel ASC, st.seatNumber ASC
    `, [bookingId]);

    const foodOrders = await require('@/lib/db').query(`
      SELECT fo.quantity, fo.unitPrice, fi.name, fi.category, fi.image
      FROM FoodOrderItem fo
      JOIN FoodItem fi ON fo.foodItemId = fi.id
      WHERE fo.bookingId = ?
    `, [bookingId]);

    return NextResponse.json({
      success: true,
      booking: {
        ...booking,
        seats,
        foodOrders
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Cancel Booking & Refund API + Cancellation Email Trigger
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const bookingId = params.id;
    const booking = await queryOne(`
      SELECT b.*, u.email as userEmail, m.title as movieTitle, e.title as eventTitle
      FROM Booking b
      JOIN User u ON b.userId = u.id
      LEFT JOIN Show s ON b.showId = s.id
      LEFT JOIN Movie m ON s.movieId = m.id
      LEFT JOIN Event e ON b.eventId = e.id
      WHERE b.id = ?
    `, [bookingId]);

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    if (booking.status === 'CANCELLED') {
      return NextResponse.json({ success: false, error: "Booking is already cancelled" }, { status: 400 });
    }

    const refundAmount = Math.round(booking.totalAmount * 0.85); // 85% refund after 15% cancellation fee

    await execute(`UPDATE Booking SET status = 'CANCELLED' WHERE id = ?`, [bookingId]);
    await execute(`UPDATE Payment SET status = 'REFUNDED' WHERE id = ?`, [bookingId]);

    await execute(`
      INSERT INTO Notification (id, userId, title, message, type)
      VALUES (?, ?, ?, ?, 'SYSTEM')
    `, [`notif_cancel_${bookingId}`, booking.userId, "Booking Cancelled", `Your booking ${booking.bookingCode} has been cancelled. Refund of ₹${refundAmount} has been processed to original payment method.`, 'SYSTEM']);

    // Send Cancellation Email
    try {
      const html = generateCancellationHtml(booking, refundAmount);
      await sendEmail({
        to: booking.userEmail,
        subject: `Booking Cancelled – ${booking.movieTitle || booking.eventTitle} | CineGo`,
        html,
        emailType: 'BOOKING_CANCELLATION',
        userId: booking.userId,
        bookingId: booking.id
      });
    } catch (emailErr) {
      console.error("[Cancellation Email Error]", emailErr);
    }

    return NextResponse.json({
      success: true,
      refundAmount,
      message: `Booking cancelled successfully. Refund of ₹${refundAmount} processed.`
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

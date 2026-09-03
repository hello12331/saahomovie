import { NextResponse } from 'next/server';
const { queryOne, execute } = require('@/lib/db');
import { sendEmail, generateBookingConfirmationHtml } from '@/lib/emailService';

export async function POST(request: Request) {
  try {
    const {
      showId,
      userId = 'u_demo',
      seatIds = [],
      seatPrices = {},
      foodOrders = [],
      couponCode = null,
      paymentMethod = 'UPI',
      userEmail = 'allinoneuser11@gmail.com'
    } = await request.json();

    if (!showId || seatIds.length === 0) {
      return NextResponse.json({ success: false, error: 'Show ID and seat selection are required.' }, { status: 400 });
    }

    const show = await queryOne(`
      SELECT s.*, m.title as movieTitle, c.name as cinemaName, c.address as cinemaAddress, e.title as eventTitle
      FROM Show s
      LEFT JOIN Movie m ON s.movieId = m.id
      LEFT JOIN Cinema c ON s.cinemaId = c.id
      LEFT JOIN Event e ON s.eventId = e.id
      WHERE s.id = ?
    `, [showId]);

    if (!show) {
      return NextResponse.json({ success: false, error: 'Show not found.' }, { status: 404 });
    }

    let ticketAmount = 0;
    seatIds.forEach((sid: string) => {
      ticketAmount += (seatPrices[sid] || show.regularPrice || 250);
    });

    let foodAmount = 0;
    foodOrders.forEach((fo: any) => {
      foodAmount += (fo.price * fo.quantity);
    });

    const subtotal = ticketAmount + foodAmount;
    const convenienceFee = Math.round(subtotal * 0.08);
    const taxAmount = Math.round((subtotal + convenienceFee) * 0.18);

    let discountAmount = 0;
    if (couponCode) {
      const coupon = await queryOne(`SELECT * FROM Coupon WHERE code = ? AND minAmount <= ?`, [couponCode, subtotal]);
      if (coupon) {
        if (coupon.discountType === 'PERCENTAGE') {
          discountAmount = Math.round((subtotal * coupon.discountVal) / 100);
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else if (coupon.discountType === 'FLAT') {
          discountAmount = coupon.discountVal;
        }
      }
    }

    const totalAmount = Math.max(0, subtotal + convenienceFee + taxAmount - discountAmount);
    const bookingId = 'b_' + Date.now();
    const bookingCode = 'CG-' + Math.floor(100000 + Math.random() * 900000);

    // Save booking
    await execute(`
      INSERT INTO Booking (
        id, bookingCode, userId, showId, totalAmount, ticketAmount, foodAmount,
        convenienceFee, taxAmount, discountAmount, paymentMethod, status, isPaid
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', 1)
    `, [
      bookingId, bookingCode, userId, showId, totalAmount, ticketAmount, foodAmount,
      convenienceFee, taxAmount, discountAmount, paymentMethod
    ]);

    // Book seats
    for (const sid of seatIds) {
      const bseatId = 'bs_' + Date.now() + '_' + sid;
      const price = seatPrices[sid] || show.regularPrice || 250;
      await execute(`
        INSERT INTO BookingSeat (id, bookingId, seatId, price)
        VALUES (?, ?, ?, ?)
      `, [bseatId, bookingId, sid, price]);

      await execute(`UPDATE Seat SET status = 'BOOKED' WHERE id = ?`, [sid]);
    }

    // Save food items
    for (const fo of foodOrders) {
      const bfId = 'bf_' + Date.now() + '_' + fo.id;
      await execute(`
        INSERT INTO BookingFood (id, bookingId, foodItemId, quantity, price)
        VALUES (?, ?, ?, ?, ?)
      `, [bfId, bookingId, fo.id, fo.quantity, fo.price]);
    }

    const bookingObject = {
      bookingCode,
      movieTitle: show.movieTitle || show.eventTitle || 'Saaho Movie Show',
      cinemaName: show.cinemaName || 'Saaho Cinema',
      startTime: show.startTime,
      createdAt: new Date().toISOString(),
      ticketAmount,
      foodAmount,
      convenienceFee,
      taxAmount,
      totalAmount,
      seats: seatIds.map((sid: string) => ({ rowLabel: 'Seat ', seatNumber: sid }))
    };

    // Send Ticket Confirmation Email via EmailJS template_7g5h46g
    const html = generateBookingConfirmationHtml(bookingObject);
    await sendEmail({
      to: userEmail,
      subject: `🎉 Booking Confirmed! Pass Code: ${bookingCode}`,
      html,
      emailType: 'TICKET_CONFIRMATION',
      bookingId,
      templateParams: {
        email: userEmail,
        bookingCode,
        passcode: bookingCode,
        movieTitle: show.movieTitle || show.eventTitle || 'Saaho Movie Show',
        cinemaName: show.cinemaName || 'CineGo Cinema',
        seats: seatIds.join(', '),
        totalAmount: `₹${totalAmount}`
      }
    });

    return NextResponse.json({
      success: true,
      bookingId,
      bookingCode,
      message: 'Booking confirmed and ticket email sent successfully!'
    });
  } catch (error: any) {
    console.error("[Booking API Error]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

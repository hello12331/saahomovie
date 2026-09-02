import { NextResponse } from 'next/server';
const { query, queryOne, execute } = require('@/lib/db');
import { sendEmail, generateBookingConfirmationHtml } from '@/lib/emailService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      showId,
      eventId,
      userId = "u_demo",
      seatIds = [],
      seatPrices = {},
      foodOrders = [],
      couponCode,
      paymentMethod = "UPI"
    } = body;

    let ticketAmount = 0;
    if (showId && seatIds.length > 0) {
      seatIds.forEach((sid: string) => {
        ticketAmount += (seatPrices[sid] || 250);
      });
    }

    let foodAmount = 0;
    foodOrders.forEach((fo: any) => {
      foodAmount += (fo.price * fo.quantity);
    });

    let eventAmount = 0;
    if (eventId) {
      const ev = await queryOne(`SELECT price FROM Event WHERE id = ?`, [eventId]);
      if (ev) eventAmount = ev.price * (body.ticketCount || 1);
      ticketAmount = eventAmount;
    }

    const subtotal = ticketAmount + foodAmount;
    const convenienceFee = Math.round(subtotal * 0.08);
    const taxAmount = Math.round((subtotal + convenienceFee) * 0.18);

    let discountAmount = 0;
    if (couponCode) {
      const coupon = await queryOne(`SELECT * FROM Coupon WHERE code = ? AND isActive = 1`, [couponCode.toUpperCase()]);
      if (coupon && subtotal >= coupon.minAmount) {
        if (coupon.discountType === "PERCENTAGE") {
          discountAmount = Math.round((subtotal * coupon.discountVal) / 100);
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else if (coupon.discountType === "FLAT") {
          discountAmount = coupon.discountVal;
        }
      }
    }

    const totalAmount = Math.max(0, subtotal + convenienceFee + taxAmount - discountAmount);
    const cineCoinsEarned = Math.floor(totalAmount / 20); // 5 coins per 100 spent

    const bookingId = "bk_" + Date.now();
    const bookingCode = "CINE-" + Math.floor(100000 + Math.random() * 900000);
    const transactionId = "TXN" + Date.now();

    // Create Booking record
    await execute(`
      INSERT INTO Booking (id, bookingCode, userId, showId, eventId, ticketAmount, foodAmount, convenienceFee, taxAmount, discountAmount, totalAmount, cineCoinsEarned, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED')
    `, [bookingId, bookingCode, userId, showId || null, eventId || null, ticketAmount, foodAmount, convenienceFee, taxAmount, discountAmount, totalAmount, cineCoinsEarned]);

    // Insert booked seats
    if (showId) {
      for (const seatId of seatIds) {
        await execute(`
          INSERT INTO BookingSeat (id, bookingId, seatId, price)
          VALUES (?, ?, ?, ?)
        `, [`bs_${bookingId}_${seatId}`, bookingId, seatId, seatPrices[seatId] || 250]);

        // Clear lock
        await execute(`DELETE FROM SeatLock WHERE showId = ? AND seatId = ?`, [showId, seatId]);
      }
    }

    // Insert food items
    for (const fo of foodOrders) {
      await execute(`
        INSERT INTO FoodOrderItem (id, bookingId, foodItemId, quantity, unitPrice)
        VALUES (?, ?, ?, ?, ?)
      `, [`fo_${bookingId}_${fo.id}`, bookingId, fo.id, fo.quantity, fo.price]);
    }

    // Create Payment record
    await execute(`
      INSERT INTO Payment (id, bookingId, paymentMethod, transactionId, amount, status)
      VALUES (?, ?, ?, ?, ?, 'SUCCESS')
    `, [`pay_${bookingId}`, bookingId, paymentMethod, transactionId, totalAmount]);

    // Update user CineCoins balance
    await execute(`UPDATE User SET cineCoinsBalance = cineCoinsBalance + ? WHERE id = ?`, [cineCoinsEarned, userId]);

    // Send Notification
    await execute(`
      INSERT INTO Notification (id, userId, title, message, type)
      VALUES (?, ?, ?, ?, 'BOOKING')
    `, [`notif_${bookingId}`, userId, "Booking Confirmed!", `Your ticket ${bookingCode} has been successfully booked. Enjoy your show!`, 'BOOKING']);

    // --- AUTOMATIC EMAIL TRIGGER AFTER SUCCESSFUL CONFIRMATION ---
    try {
      const userObj = await queryOne(`SELECT email, name FROM User WHERE id = ?`, [userId]);
      const fullBookingObj = await queryOne(`
        SELECT b.*, m.title as movieTitle, c.name as cinemaName, e.title as eventTitle
        FROM Booking b
        LEFT JOIN Show s ON b.showId = s.id
        LEFT JOIN Movie m ON s.movieId = m.id
        LEFT JOIN Cinema c ON s.cinemaId = c.id
        LEFT JOIN Event e ON b.eventId = e.id
        WHERE b.id = ?
      `, [bookingId]);

      if (userObj) {
        const html = generateBookingConfirmationHtml(fullBookingObj);
        await sendEmail({
          to: userObj.email,
          subject: `Booking Confirmed – ${fullBookingObj.movieTitle || fullBookingObj.eventTitle} | CineGo`,
          html,
          emailType: 'BOOKING_CONFIRMATION',
          userId,
          bookingId
        });
      }
    } catch (emailErr) {
      console.error("[Post Booking Email Error]", emailErr);
    }

    return NextResponse.json({
      success: true,
      bookingId,
      bookingCode,
      totalAmount,
      cineCoinsEarned,
      message: "Booking completed and confirmation email dispatched!"
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

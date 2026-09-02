const { execute, query } = require('@/lib/db');
const nodemailer = require('nodemailer');

// Abstracted Email Provider Adapter
// Supports Nodemailer SMTP (Gmail / SMTP / Custom), EmailJS API parameters, and fallback console/log mode for dev
export async function sendEmail({
  to,
  subject,
  html,
  text = '',
  emailType = 'SYSTEM',
  userId = null,
  bookingId = null
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  emailType?: string;
  userId?: string | null;
  bookingId?: string | null;
}) {
  const logId = 'elog_' + Date.now();
  let status = 'SENT';
  let errorMessage = null;

  try {
    // 1. Try Nodemailer SMTP if env variables or standard config is present
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const user = process.env.EMAIL_USERNAME || process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;

    if (user && pass) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
      });

      await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || 'CineGo Team'}" <${user}>`,
        to,
        subject,
        html,
        text
      });
      console.log(`[Email Service] Live SMTP Email sent to ${to} for subject: ${subject}`);
    } else {
      // 2. Safe Fallback Dev Mode (Logged securely in DB & Console)
      console.log(`\n=================== [CINEGO EMAIL SERVICE] ===================`);
      console.log(`TO: ${to}`);
      console.log(`SUBJECT: ${subject}`);
      console.log(`TYPE: ${emailType}`);
      console.log(`HTML CONTENT PREVIEW:\n${html.substring(0, 300)}...`);
      console.log(`=============================================================\n`);
    }
  } catch (err: any) {
    status = 'FAILED';
    errorMessage = err.message || 'SMTP Transmission failed';
    console.error(`[Email Service Error] Failed to send email to ${to}:`, err);
  } finally {
    // 3. Always log attempt to EmailLog table for Admin Audit
    try {
      await execute(`
        INSERT INTO EmailLog (id, userId, bookingId, emailType, recipient, subject, status, errorMessage)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [logId, userId, bookingId, emailType, to, subject, status, errorMessage]);
    } catch (dbErr) {
      console.error("[Email Log DB Error]", dbErr);
    }
  }

  return { success: status === 'SENT', logId, status, errorMessage };
}

// 1. OTP Email Template
export function generateOtpEmailHtml(userName: string, otp: string) {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #0F1117; color: #ffffff; padding: 40px 20px; border-radius: 16px; max-width: 600px; margin: auto;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #FF4D6D; margin: 0; font-size: 28px;">Cine<span style="color: #ffffff;">Go</span></h1>
        <p style="color: #A8ACB8; font-size: 12px; margin-top: 4px;">YOUR ENTERTAINMENT. ONE PLACE.</p>
      </div>
      
      <div style="background-color: #171A23; border: 1px solid #20232D; padding: 32px; border-radius: 12px; text-align: center;">
        <h2 style="color: #ffffff; font-size: 20px; margin-top: 0;">Your One-Time Password (OTP)</h2>
        <p style="color: #A8ACB8; font-size: 14px;">Hello ${userName},</p>
        <p style="color: #A8ACB8; font-size: 14px;">Your one-time password (OTP) for signing in to CineGo is:</p>
        
        <div style="background-color: #20232D; border: 2px border: #FF4D6D; color: #FF4D6D; font-size: 36px; font-weight: bold; letter-spacing: 8px; padding: 16px; border-radius: 8px; margin: 24px 0; display: inline-block;">
          ${otp}
        </div>
        
        <p style="color: #A8ACB8; font-size: 12px;">This OTP is valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
      </div>
      
      <p style="color: #666; font-size: 11px; text-align: center; margin-top: 24px;">Regards,<br>CineGo Team</p>
    </div>
  `;
}

// 2. Booking Confirmation Email Template
export function generateBookingConfirmationHtml(booking: any) {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #0F1117; color: #ffffff; padding: 40px 20px; max-width: 600px; margin: auto;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #FF4D6D; margin: 0;">Cine<span style="color: #ffffff;">Go</span></h1>
        <h2 style="color: #4ADE80; font-size: 22px;">🎉 Booking Confirmed!</h2>
      </div>

      <div style="background-color: #171A23; border: 1px solid #20232D; padding: 24px; border-radius: 12px; margin-bottom: 20px;">
        <h3 style="color: #FF4D6D; border-bottom: 1px solid #20232D; padding-bottom: 8px; margin-top: 0;">BOOKING DETAILS</h3>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Booking ID:</strong> ${booking.bookingCode}</p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Movie:</strong> ${booking.movieTitle || booking.eventTitle}</p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Cinema/Venue:</strong> ${booking.cinemaName || booking.eventVenue}</p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Date & Time:</strong> ${booking.startTime || booking.createdAt}</p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Seats:</strong> ${booking.seats?.map((s: any) => `${s.rowLabel}${s.seatNumber}`).join(', ') || 'Confirmed'}</p>
      </div>

      <div style="background-color: #171A23; border: 1px solid #20232D; padding: 24px; border-radius: 12px; margin-bottom: 20px;">
        <h3 style="color: #7C5CFC; border-bottom: 1px solid #20232D; padding-bottom: 8px; margin-top: 0;">PAYMENT BREAKDOWN</h3>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Ticket Price:</strong> ₹${booking.ticketAmount}</p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Food & Beverages:</strong> ₹${booking.foodAmount}</p>
        <p style="margin: 6px 0; font-size: 14px;"><strong>Convenience Fee & Taxes:</strong> ₹${booking.convenienceFee + booking.taxAmount}</p>
        <p style="margin: 6px 0; font-size: 16px; color: #4ADE80; border-top: 1px solid #20232D; pt: 8px;"><strong>TOTAL PAID:</strong> ₹${booking.totalAmount}</p>
      </div>

      <p style="color: #A8ACB8; font-size: 12px; text-align: center;">Please show your digital pass QR at cinema entry. Enjoy your show!</p>
    </div>
  `;
}

// 3. Booking Cancellation Email Template
export function generateCancellationHtml(booking: any, refundAmount: number) {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #0F1117; color: #ffffff; padding: 40px 20px; max-width: 600px; margin: auto;">
      <h1 style="color: #FF4D6D; text-align: center;">CineGo</h1>
      <div style="background-color: #171A23; border: 1px solid #20232D; padding: 24px; border-radius: 12px;">
        <h2 style="color: #F87171; margin-top: 0;">Booking Cancelled</h2>
        <p style="font-size: 14px;">Booking ID: <strong>${booking.bookingCode}</strong></p>
        <p style="font-size: 14px;">Original Amount: ₹${booking.totalAmount}</p>
        <p style="font-size: 14px; color: #4ADE80;"><strong>Refund Amount (85%): ₹${refundAmount}</strong></p>
        <p style="font-size: 12px; color: #A8ACB8;">Refund has been processed to your original payment method.</p>
      </div>
    </div>
  `;
}

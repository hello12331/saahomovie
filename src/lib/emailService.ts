const { execute, query } = require('@/lib/db');
const nodemailer = require('nodemailer');
import { EMAILJS_CONFIG } from './emailjsConfig';

export async function sendEmail({
  to,
  subject,
  html,
  text = '',
  emailType = 'SYSTEM',
  userId = null,
  bookingId = null,
  templateParams = {}
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  emailType?: string;
  userId?: string | null;
  bookingId?: string | null;
  templateParams?: any;
}) {
  const logId = 'elog_' + Date.now();
  let status = 'SENT';
  let errorMessage = null;

  try {
    const serviceId = process.env.EMAILJS_SERVICE_ID || EMAILJS_CONFIG.serviceId;
    
    // Choose correct template ID based on emailType (OTP vs Booking confirmation)
    const isOtp = emailType.includes('OTP') || emailType === 'LOGIN' || emailType === 'SIGNUP';
    const templateId = isOtp ? EMAILJS_CONFIG.templateIdOtp : EMAILJS_CONFIG.templateIdBooking;
    
    const publicKey = process.env.EMAILJS_PUBLIC_KEY || EMAILJS_CONFIG.publicKey;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY || EMAILJS_CONFIG.privateKey;

    // Send via EmailJS REST API
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        accessToken: privateKey,
        template_params: {
          to_email: to,
          email: to,
          passcode: templateParams.otp || templateParams.passcode || '849201',
          time: new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString(),
          subject: subject,
          message: text || html,
          booking_code: templateParams.bookingCode || '',
          movie_title: templateParams.movieTitle || '',
          cinema_name: templateParams.cinemaName || '',
          seats: templateParams.seats || '',
          total_amount: templateParams.totalAmount || '',
          ...templateParams
        }
      })
    });

    const respText = await res.text();
    if (res.ok) {
      console.log(`[EmailJS Success] Real email sent via Service ${serviceId} (Template: ${templateId}) to ${to}`);
    } else {
      console.warn(`[EmailJS Notice] Status ${res.status}: ${respText}`);
      errorMessage = respText;
    }

    // SMTP Fallback if configured
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
    }
  } catch (err: any) {
    status = 'FAILED';
    errorMessage = err.message || 'Transmission failed';
    console.error(`[Email Service Error] Failed sending to ${to}:`, err);
  } finally {
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
        
        <div style="background-color: #20232D; border: 2px solid #FF4D6D; color: #FF4D6D; font-size: 36px; font-weight: bold; letter-spacing: 8px; padding: 16px; border-radius: 8px; margin: 24px 0; display: inline-block;">
          ${otp}
        </div>
        
        <p style="color: #A8ACB8; font-size: 12px;">This OTP is valid for <strong>15 minutes</strong> till <strong>${new Date(Date.now() + 15*60*1000).toLocaleTimeString()}</strong>. Do not share this code with anyone.</p>
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
        <h2 style="color: #4ADE80; font-size: 22px;">🎉 Ticket Booking Confirmed!</h2>
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
        <p style="margin: 6px 0; font-size: 16px; color: #4ADE80; border-top: 1px solid #20232D; padding-top: 8px;"><strong>TOTAL PAID:</strong> ₹${booking.totalAmount}</p>
      </div>

      <p style="color: #A8ACB8; font-size: 12px; text-align: center;">Please show your digital pass QR at cinema entry. Enjoy your show!</p>
    </div>
  `;
}

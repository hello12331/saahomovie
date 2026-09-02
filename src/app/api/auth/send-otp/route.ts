import { NextResponse } from 'next/server';
const { queryOne, execute } = require('@/lib/db');
import { sendEmail, generateOtpEmailHtml } from '@/lib/emailService';

export async function POST(request: Request) {
  try {
    const { email, purpose = 'LOGIN', userName = 'User' } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // Generate secure 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min TTL
    const otpId = 'otp_' + Date.now();

    // Invalidate existing unused OTPs for email
    await execute(`UPDATE OtpStore SET used = 1 WHERE email = ? AND purpose = ?`, [email.toLowerCase(), purpose]);

    // Save new OTP
    await execute(`
      INSERT INTO OtpStore (id, email, otpCode, purpose, expiresAt)
      VALUES (?, ?, ?, ?, ?)
    `, [otpId, email.toLowerCase(), otpCode, purpose, expiresAt]);

    // Send OTP via Email Service
    const subject = purpose === 'LOGIN' ? 'Your CineGo Login OTP' : 'Reset Your CineGo Password OTP';
    const html = generateOtpEmailHtml(userName, otpCode);

    await sendEmail({
      to: email.toLowerCase(),
      subject,
      html,
      emailType: purpose
    });

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to ${email}.`,
      expiresAt
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

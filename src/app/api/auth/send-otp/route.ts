import { NextResponse } from 'next/server';
const { queryOne, execute } = require('@/lib/db');
import { sendEmail, generateOtpEmailHtml } from '@/lib/emailService';

export async function POST(request: Request) {
  try {
    const { email, purpose = 'LOGIN', userName = 'User' } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const otpId = 'otp_' + Date.now();

    await execute(`UPDATE OtpStore SET used = 1 WHERE email = ? AND purpose = ?`, [email.toLowerCase(), purpose]);

    await execute(`
      INSERT INTO OtpStore (id, email, otpCode, purpose, expiresAt)
      VALUES (?, ?, ?, ?, ?)
    `, [otpId, email.toLowerCase(), otpCode, purpose, expiresAt]);

    // Construct full email message body containing the 6-digit OTP code text
    const fullMessage = `Hello ${userName},\n\nYour 6-digit One Time Password (OTP) for authentication is:\n\n${otpCode}\n\nThis OTP is valid for 15 minutes. Please do not share it with anyone.`;
    const subject = `Your OTP Code is ${otpCode}`;
    const html = generateOtpEmailHtml(userName, otpCode);

    // Send via EmailJS Service service_766n4tq + Template template_je4twyg
    await sendEmail({
      to: email.toLowerCase(),
      subject,
      html,
      emailType: purpose,
      templateParams: {
        email: email.toLowerCase(),
        to_email: email.toLowerCase(),
        passcode: otpCode,
        otp: otpCode,
        otp_code: otpCode,
        code: otpCode,
        password: otpCode,
        number: otpCode,
        message: fullMessage,
        time: new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString()
      }
    });

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to ${email}.`,
      otpCode, // Returned for dev testing convenience
      expiresAt
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

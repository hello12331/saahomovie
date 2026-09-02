import { NextResponse } from 'next/server';
const { queryOne, execute } = require('@/lib/db');

export async function POST(request: Request) {
  try {
    const { email, otpCode, purpose = 'LOGIN' } = await request.json();

    if (!email || !otpCode) {
      return NextResponse.json({ success: false, error: 'Email and 6-digit OTP code are required.' }, { status: 400 });
    }

    const otpRecord = await queryOne(`
      SELECT * FROM OtpStore 
      WHERE email = ? AND purpose = ? AND used = 0 
      ORDER BY createdAt DESC LIMIT 1
    `, [email.toLowerCase(), purpose]);

    if (!otpRecord) {
      return NextResponse.json({ success: false, error: 'No active OTP found for this email. Please request a new OTP.' }, { status: 400 });
    }

    // Check expiration
    if (new Date(otpRecord.expiresAt) < new Date()) {
      return NextResponse.json({ success: false, error: 'OTP has expired (5 min TTL). Please click Resend OTP.' }, { status: 400 });
    }

    // Check attempts limit
    if (otpRecord.attempts >= 5) {
      return NextResponse.json({ success: false, error: 'Maximum verification attempts exceeded. Please request a new OTP.' }, { status: 400 });
    }

    if (otpRecord.otpCode !== otpCode.trim()) {
      await execute(`UPDATE OtpStore SET attempts = attempts + 1 WHERE id = ?`, [otpRecord.id]);
      return NextResponse.json({ success: false, error: 'Invalid OTP code. Please try again.' }, { status: 400 });
    }

    // Mark OTP used
    await execute(`UPDATE OtpStore SET used = 1 WHERE id = ?`, [otpRecord.id]);

    // Find or auto-create User
    let user = await queryOne(`SELECT * FROM User WHERE email = ?`, [email.toLowerCase()]);
    if (!user) {
      const userId = 'u_' + Date.now();
      await execute(`
        INSERT INTO User (id, name, email, passwordHash, role, savedCity, cineCoinsBalance)
        VALUES (?, ?, ?, '$2a$10$dummyhash', 'USER', 'Hyderabad', 100)
      `, [userId, email.split('@')[0], email.toLowerCase()]);
      user = await queryOne(`SELECT * FROM User WHERE id = ?`, [userId]);
    }

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        cineCoinsBalance: user.cineCoinsBalance
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

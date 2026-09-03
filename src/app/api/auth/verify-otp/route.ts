import { NextResponse } from 'next/server';
const { queryOne, execute } = require('@/lib/db');

export async function POST(request: Request) {
  try {
    const { email, otpCode, fullName, location } = await request.json();

    if (!email || !otpCode) {
      return NextResponse.json({ success: false, error: 'Email and 6-digit OTP code are required.' }, { status: 400 });
    }

    // Match recent active OTP for this email across any purpose tag (LOGIN_OTP, SIGNUP_OTP, etc.)
    const otpRecord = await queryOne(`
      SELECT * FROM OtpStore 
      WHERE email = ? AND used = 0 
      ORDER BY createdAt DESC LIMIT 1
    `, [email.toLowerCase()]);

    if (!otpRecord) {
      return NextResponse.json({ success: false, error: 'No active OTP found for this email. Please request a new OTP.' }, { status: 400 });
    }

    // Check expiration (15 min TTL)
    if (new Date(otpRecord.expiresAt) < new Date()) {
      return NextResponse.json({ success: false, error: 'OTP has expired (15 min TTL). Please request a new OTP.' }, { status: 400 });
    }

    // Check attempts limit
    if (otpRecord.attempts >= 5) {
      return NextResponse.json({ success: false, error: 'Maximum verification attempts exceeded. Please request a new OTP.' }, { status: 400 });
    }

    if (otpRecord.otpCode !== otpCode.trim()) {
      await execute(`UPDATE OtpStore SET attempts = attempts + 1 WHERE id = ?`, [otpRecord.id]);
      return NextResponse.json({ success: false, error: 'Invalid OTP code. Please verify the code in your email.' }, { status: 400 });
    }

    // Mark OTP used
    await execute(`UPDATE OtpStore SET used = 1 WHERE id = ?`, [otpRecord.id]);

    // Find or auto-create User
    let user = await queryOne(`SELECT * FROM User WHERE email = ?`, [email.toLowerCase()]);
    const userName = fullName || (user ? user.name : email.split('@')[0]);
    const userCity = location || (user ? user.savedCity : 'Hyderabad');

    if (!user) {
      const userId = 'u_' + Date.now();
      await execute(`
        INSERT INTO User (id, name, email, passwordHash, role, savedCity, cineCoinsBalance)
        VALUES (?, ?, ?, '$2a$10$dummyhash', 'USER', ?, 100)
      `, [userId, userName, email.toLowerCase(), userCity]);
      user = await queryOne(`SELECT * FROM User WHERE id = ?`, [userId]);
    } else if (fullName || location) {
      await execute(`UPDATE User SET name = ?, savedCity = ? WHERE id = ?`, [userName, userCity, user.id]);
      user = await queryOne(`SELECT * FROM User WHERE id = ?`, [user.id]);
    }

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        savedCity: user.savedCity,
        cineCoinsBalance: user.cineCoinsBalance
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
const { query } = require('@/lib/db');

export async function GET(request: Request) {
  try {
    const foodItems = await query(`SELECT * FROM FoodItem WHERE isAvailable = 1 ORDER BY category ASC`);
    const coupons = await query(`SELECT * FROM Coupon WHERE isActive = 1`);
    const events = await query(`SELECT * FROM Event WHERE isPublished = 1 ORDER BY eventDate ASC`);

    return NextResponse.json({
      success: true,
      foodItems,
      coupons,
      events
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

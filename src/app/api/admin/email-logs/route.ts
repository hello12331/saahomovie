import { NextResponse } from 'next/server';
const { queryOne, execute } = require('@/lib/db');

export async function GET(request: Request) {
  try {
    const logs = await queryOne(`SELECT COUNT(*) as total FROM EmailLog`);
    const recentLogs = await require('@/lib/db').query(`
      SELECT * FROM EmailLog ORDER BY sentAt DESC LIMIT 30
    `);

    return NextResponse.json({
      success: true,
      totalCount: logs.total,
      logs: recentLogs
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

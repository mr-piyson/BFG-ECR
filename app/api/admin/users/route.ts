import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET() {
  try {
    const users = await sql`
      SELECT * FROM users
      ORDER BY created_at DESC
    `
    return NextResponse.json(users)
  } catch (error) {
    console.error('[Admin Users API]', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

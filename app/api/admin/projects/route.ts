import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET() {
  try {
    const projects = await sql`
      SELECT * FROM projects
      ORDER BY created_at DESC
    `
    return NextResponse.json(projects)
  } catch (error) {
    console.error('[Admin Projects API]', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

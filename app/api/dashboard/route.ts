import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'user-de-1'

    // Get current user role
    const [user] = await sql`SELECT id, role FROM users WHERE id = ${userId}`
    const role = user?.role || 'DESIGN_ENGINEER'

    // Summary counts
    const [counts] = await sql`
      SELECT
        COUNT(*) FILTER (WHERE status NOT IN ('CANCELLED')) AS total,
        COUNT(*) FILTER (WHERE status NOT IN ('DRAFT','RELEASED','ON_HOLD','CANCELLED','RETURNED_TO_DESIGN','RETURNED_TO_COSTING','RETURNED_TO_PROJECT_MANAGER')) AS under_process,
        COUNT(*) FILTER (WHERE status = 'RELEASED') AS released,
        COUNT(*) FILTER (WHERE status = 'ON_HOLD') AS on_hold,
        COUNT(*) FILTER (WHERE status IN ('RETURNED_TO_DESIGN','RETURNED_TO_COSTING','RETURNED_TO_PROJECT_MANAGER')) AS returned,
        COUNT(*) FILTER (WHERE status = 'DRAFT') AS draft,
        COUNT(*) FILTER (WHERE status = 'CANCELLED') AS cancelled
      FROM ecrs
    `

    // By project
    const byProject = await sql`
      SELECT p.code AS project_code, p.name AS project_name, COUNT(e.id)::int AS count
      FROM projects p
      LEFT JOIN ecrs e ON e.project_id = p.id AND e.status != 'CANCELLED'
      GROUP BY p.id, p.code, p.name
      ORDER BY count DESC
    `

    // By status
    const byStatus = await sql`
      SELECT status, COUNT(*)::int AS count
      FROM ecrs
      WHERE status != 'CANCELLED'
      GROUP BY status
      ORDER BY count DESC
    `

    // My queue — ECRs awaiting MY action based on role
    let myQueueCondition = sql`FALSE`
    if (role === 'DESIGN_ENGINEER') {
      myQueueCondition = sql`(e.design_engineer_id = ${userId} AND e.status IN ('DRAFT','RETURNED_TO_DESIGN','PENDING_DESIGN_MEETING','UNDER_DESIGN_MEETING'))`
    } else if (role === 'COSTING_ENGINEER') {
      myQueueCondition = sql`(e.status IN ('PENDING_COSTING','UNDER_COSTING'))`
    } else if (role === 'PROJECT_ENGINEER') {
      myQueueCondition = sql`(e.project_engineer_id = ${userId} AND e.status IN ('PENDING_PROJECT_MANAGER','UNDER_PROJECT_MANAGER'))`
    } else if (role === 'QUALITY_ENGINEER') {
      myQueueCondition = sql`(e.status IN ('PENDING_QUALITY_CHECK','UNDER_QUALITY_CHECK'))`
    } else if (role === 'ADMIN') {
      myQueueCondition = sql`(e.status IN ('ON_HOLD','PENDING_COSTING','PENDING_PROJECT_MANAGER','PENDING_DESIGN_MEETING','PENDING_QUALITY_CHECK'))`
    }

    const myQueue = await sql`
      SELECT e.*, p.code AS project_code, p.name AS project_name,
             u.name AS design_engineer_name,
             s.name AS scope_name
      FROM ecrs e
      JOIN projects p ON p.id = e.project_id
      JOIN users u ON u.id = e.design_engineer_id
      LEFT JOIN project_scopes s ON s.id = e.scope_id
      WHERE ${myQueueCondition}
      ORDER BY e.updated_at DESC
      LIMIT 8
    `

    // Recent activity
    const recentActivity = await sql`
      SELECT sh.*, u.name AS acted_by_name, u.role AS acted_by_role,
             e.ecr_number, p.code AS project_code
      FROM stage_histories sh
      JOIN users u ON u.id = sh.acted_by_user_id
      JOIN ecrs e ON e.id = sh.ecr_id
      JOIN projects p ON p.id = e.project_id
      ORDER BY sh.created_at DESC
      LIMIT 10
    `

    return NextResponse.json({
      counts: {
        total: parseInt(counts.total),
        under_process: parseInt(counts.under_process),
        released: parseInt(counts.released),
        on_hold: parseInt(counts.on_hold),
        returned: parseInt(counts.returned),
        draft: parseInt(counts.draft),
        cancelled: parseInt(counts.cancelled),
      },
      by_project: byProject,
      by_status: byStatus,
      my_queue: myQueue,
      recent_activity: recentActivity,
    })
  } catch (error) {
    console.error('[ECR Dashboard API]', error)
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Main ECR
    const [ecr] = await sql`
      SELECT
        e.*,
        p.code AS project_code, p.name AS project_name, p.description AS project_description,
        s.name AS scope_name,
        u.name AS design_engineer_name, u.email AS design_engineer_email, u.role AS design_engineer_role,
        pm.name AS project_engineer_name, pm.email AS project_engineer_email
      FROM ecrs e
      JOIN projects p ON p.id = e.project_id
      LEFT JOIN project_scopes s ON s.id = e.scope_id
      JOIN users u ON u.id = e.design_engineer_id
      LEFT JOIN users pm ON pm.id = e.project_engineer_id
      WHERE e.id = ${id}
    `

    if (!ecr) {
      return NextResponse.json({ error: 'ECR not found' }, { status: 404 })
    }

    // Stage forms
    const [designInitialForm] = await sql`SELECT * FROM design_initial_forms WHERE ecr_id = ${id}`
    const [costingForm] = await sql`SELECT * FROM costing_forms WHERE ecr_id = ${id}`
    const [projectManagerForm] = await sql`SELECT * FROM project_manager_forms WHERE ecr_id = ${id}`
    const [designMeetingFormRaw] = await sql`SELECT * FROM design_meeting_forms WHERE ecr_id = ${id}`
    const [qualityCheckForm] = await sql`SELECT * FROM quality_check_forms WHERE ecr_id = ${id}`

    // Meeting attendees
    let designMeetingForm = designMeetingFormRaw || null
    if (designMeetingFormRaw) {
      const attendees = await sql`
        SELECT * FROM meeting_attendees WHERE meeting_form_id = ${designMeetingFormRaw.id}
        ORDER BY is_external ASC, name ASC
      `
      designMeetingForm = { ...designMeetingFormRaw, attendees }
    }

    // Stage history with user info
    const stageHistories = await sql`
      SELECT sh.*, u.name AS acted_by_name, u.role AS acted_by_role, u.email AS acted_by_email
      FROM stage_histories sh
      JOIN users u ON u.id = sh.acted_by_user_id
      WHERE sh.ecr_id = ${id}
      ORDER BY sh.created_at ASC
    `

    // Attachments
    const attachments = await sql`
      SELECT * FROM attachments WHERE ecr_id = ${id} ORDER BY uploaded_at DESC
    `

    return NextResponse.json({
      ecr,
      design_initial_form: designInitialForm || null,
      costing_form: costingForm || null,
      project_manager_form: projectManagerForm || null,
      design_meeting_form: designMeetingForm,
      quality_check_form: qualityCheckForm || null,
      stage_histories: stageHistories,
      attachments,
    })
  } catch (error) {
    console.error('[ECR Detail API]', error)
    return NextResponse.json({ error: 'Failed to load ECR' }, { status: 500 })
  }
}

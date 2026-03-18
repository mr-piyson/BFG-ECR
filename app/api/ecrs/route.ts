import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const ecrs = await sql`
      SELECT
        e.id, e.ecr_number, e.status, e.source, e.current_stage,
        e.design_engineer_id, e.project_engineer_id,
        e.created_at, e.updated_at, e.released_at,
        p.id AS project_id, p.code AS project_code, p.name AS project_name,
        s.id AS scope_id, s.name AS scope_name,
        u.name AS design_engineer_name,
        pm.name AS project_engineer_name,
        dif.customer_cr_number,
        dif.change_description,
        dif.cr_received_on,
        dif.flow_status AS stage1_flow_status
      FROM ecrs e
      JOIN projects p ON p.id = e.project_id
      LEFT JOIN project_scopes s ON s.id = e.scope_id
      JOIN users u ON u.id = e.design_engineer_id
      LEFT JOIN users pm ON pm.id = e.project_engineer_id
      LEFT JOIN design_initial_forms dif ON dif.ecr_id = e.id
      WHERE
        (${projectId}::text IS NULL OR e.project_id = ${projectId})
        AND (${status}::text IS NULL OR e.status = ${status}::"ECRStatus")
        AND (
          ${search}::text IS NULL
          OR e.ecr_number::text ILIKE ${'%' + (search || '') + '%'}
          OR p.code ILIKE ${'%' + (search || '') + '%'}
          OR p.name ILIKE ${'%' + (search || '') + '%'}
          OR dif.customer_cr_number ILIKE ${'%' + (search || '') + '%'}
          OR dif.change_description ILIKE ${'%' + (search || '') + '%'}
        )
      ORDER BY e.updated_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const [{ total }] = await sql`
      SELECT COUNT(*)::int AS total
      FROM ecrs e
      JOIN projects p ON p.id = e.project_id
      LEFT JOIN design_initial_forms dif ON dif.ecr_id = e.id
      WHERE
        (${projectId}::text IS NULL OR e.project_id = ${projectId})
        AND (${status}::text IS NULL OR e.status = ${status}::"ECRStatus")
        AND (
          ${search}::text IS NULL
          OR e.ecr_number::text ILIKE ${'%' + (search || '') + '%'}
          OR p.code ILIKE ${'%' + (search || '') + '%'}
          OR p.name ILIKE ${'%' + (search || '') + '%'}
          OR dif.customer_cr_number ILIKE ${'%' + (search || '') + '%'}
          OR dif.change_description ILIKE ${'%' + (search || '') + '%'}
        )
    `

    return NextResponse.json({ ecrs, total })
  } catch (error) {
    console.error('[ECR List API]', error)
    return NextResponse.json({ error: 'Failed to load ECRs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      project_id,
      scope_id,
      source = 'CUSTOMER',
      design_engineer_id,
      project_engineer_id,
      customer_cr_number,
      cr_received_on,
      cr_by,
      change_description,
      is_skip_costing = false,
      is_skip_project_manager = false,
      is_skip_quality = false,
    } = body

    if (!project_id || !design_engineer_id || !cr_received_on || !cr_by || !change_description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create ECR
    const [ecr] = await sql`
      INSERT INTO ecrs (project_id, scope_id, source, design_engineer_id, project_engineer_id, status, current_stage)
      VALUES (
        ${project_id}, ${scope_id || null}, ${source}::"ECRSource",
        ${design_engineer_id}, ${project_engineer_id || null},
        'DRAFT'::"ECRStatus", 'DESIGN_ENGINEER_INITIAL'::"StageType"
      )
      RETURNING *
    `

    // Create design initial form
    await sql`
      INSERT INTO design_initial_forms (
        ecr_id, customer_cr_number, cr_received_on, cr_by, change_description,
        is_skip_costing, is_skip_project_manager, is_skip_quality, flow_status
      )
      VALUES (
        ${ecr.id}, ${customer_cr_number || null}, ${cr_received_on}, ${cr_by}, ${change_description},
        ${is_skip_costing}, ${is_skip_project_manager}, ${is_skip_quality}, 'PENDING'::"ECRFlowStatus"
      )
    `

    return NextResponse.json({ ecr }, { status: 201 })
  } catch (error) {
    console.error('[ECR Create API]', error)
    return NextResponse.json({ error: 'Failed to create ECR' }, { status: 500 })
  }
}

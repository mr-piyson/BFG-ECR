import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      customer_cr_number,
      change_description,
      is_skip_costing,
      is_skip_project_manager,
      is_skip_quality,
    } = body;

    if (!change_description) {
      return NextResponse.json({ error: 'Change description is required' }, { status: 400 });
    }

    // Update or create design initial form
    const [existing] = await sql`SELECT id FROM design_initial_forms WHERE ecr_id = ${id}`;

    if (existing) {
      await sql`
        UPDATE design_initial_forms
        SET 
          customer_cr_number = ${customer_cr_number || null},
          change_description = ${change_description},
          is_skip_costing = ${is_skip_costing || false},
          is_skip_project_manager = ${is_skip_project_manager || false},
          is_skip_quality = ${is_skip_quality || false},
          flow_status = 'PROCEED'::"ECRFlowStatus",
          submitted_at = NOW(),
          updated_at = NOW()
        WHERE ecr_id = ${id}
      `;
    } else {
      await sql`
        INSERT INTO design_initial_forms (
          ecr_id, 
          customer_cr_number, 
          change_description, 
          cr_received_on,
          cr_by,
          is_skip_costing, 
          is_skip_project_manager, 
          is_skip_quality,
          flow_status,
          submitted_at,
          updated_at
        )
        VALUES (
          ${id},
          ${customer_cr_number || null},
          ${change_description},
          NOW(),
          (SELECT id FROM users LIMIT 1),
          ${is_skip_costing || false},
          ${is_skip_project_manager || false},
          ${is_skip_quality || false},
          'PROCEED'::"ECRFlowStatus",
          NOW(),
          NOW()
        )
      `;
    }

    // Update ECR status
    await sql`
      UPDATE ecrs
      SET 
        status = CASE 
          WHEN ${is_skip_costing} THEN 'PENDING_PROJECT_MANAGER'::"ECRStatus"
          ELSE 'PENDING_COSTING'::"ECRStatus"
        END,
        updated_at = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[Design Initial Form API]', error);
    return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 });
  }
}

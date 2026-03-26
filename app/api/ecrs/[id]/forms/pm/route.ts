import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { po_receipt_date, roa, pm_notes } = body;

    // Update or create project manager form
    const [existing] = await sql`SELECT id FROM project_manager_forms WHERE ecr_id = ${id}`;

    if (existing) {
      await sql`
        UPDATE project_manager_forms
        SET 
          po_receipt_date = ${po_receipt_date || null},
          roa = ${roa || null},
          pm_notes = ${pm_notes || null},
          flow_status = 'PROCEED'::"ECRFlowStatus",
          submitted_at = NOW(),
          updated_at = NOW()
        WHERE ecr_id = ${id}
      `;
    } else {
      await sql`
        INSERT INTO project_manager_forms (
          ecr_id,
          po_receipt_date,
          roa,
          pm_notes,
          flow_status,
          submitted_at,
          updated_at
        )
        VALUES (
          ${id},
          ${po_receipt_date || null},
          ${roa || null},
          ${pm_notes || null},
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
        status = 'PENDING_DESIGN_MEETING'::"ECRStatus",
        current_stage = 'DESIGN_ENGINEER_MEETING'::"StageType",
        updated_at = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[PM Form API]', error);
    return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 });
  }
}

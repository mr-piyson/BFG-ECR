import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { labour_cost, material_cost, total_cost, currency, budget_impact, notes } = body;

    if (!total_cost) {
      return NextResponse.json({ error: 'Total cost is required' }, { status: 400 });
    }

    // Update or create costing form
    const [existing] = await sql`SELECT id FROM costing_forms WHERE ecr_id = ${id}`;

    if (existing) {
      await sql`
        UPDATE costing_forms
        SET 
          labour_cost = ${labour_cost || null},
          material_cost = ${material_cost || null},
          total_cost = ${total_cost},
          currency = ${currency || 'EUR'},
          budget_impact = ${budget_impact || null},
          remark = ${notes || null},
          flow_status = 'PROCEED'::"ECRFlowStatus",
          submitted_at = NOW(),
          updated_at = NOW()
        WHERE ecr_id = ${id}
      `;
    } else {
      await sql`
        INSERT INTO costing_forms (
          ecr_id,
          labour_cost,
          material_cost,
          total_cost,
          currency,
          budget_impact,
          remark,
          flow_status,
          submitted_at,
          updated_at
        )
        VALUES (
          ${id},
          ${labour_cost || null},
          ${material_cost || null},
          ${total_cost},
          ${currency || 'EUR'},
          ${budget_impact || null},
          ${notes || null},
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
        status = 'PENDING_PROJECT_MANAGER'::"ECRStatus",
        current_stage = 'PROJECT_MANAGER'::"StageType",
        updated_at = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[Costing Form API]', error);
    return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 });
  }
}

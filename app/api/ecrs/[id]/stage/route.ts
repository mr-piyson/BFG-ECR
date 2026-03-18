import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import type { ECRStatus, StageType } from '@/lib/types'

// Determine what the next status should be after proceeding from a stage,
// considering skip flags
async function getNextStatus(
  ecrId: string,
  currentStage: StageType
): Promise<{ status: ECRStatus; stage: StageType } | { status: 'RELEASED'; stage: 'QUALITY_FINAL_CHECK' }> {
  const [dif] = await sql`
    SELECT is_skip_costing, is_skip_project_manager, is_skip_quality
    FROM design_initial_forms
    WHERE ecr_id = ${ecrId}
  `
  const skip = dif || { is_skip_costing: false, is_skip_project_manager: false, is_skip_quality: false }

  if (currentStage === 'DESIGN_ENGINEER_INITIAL') {
    if (!skip.is_skip_costing) return { status: 'PENDING_COSTING', stage: 'COSTING' }
    if (!skip.is_skip_project_manager) return { status: 'PENDING_PROJECT_MANAGER', stage: 'PROJECT_MANAGER' }
    if (!skip.is_skip_quality) return { status: 'PENDING_QUALITY_CHECK', stage: 'QUALITY_FINAL_CHECK' }
    return { status: 'RELEASED', stage: 'QUALITY_FINAL_CHECK' }
  }
  if (currentStage === 'COSTING') {
    if (!skip.is_skip_project_manager) return { status: 'PENDING_PROJECT_MANAGER', stage: 'PROJECT_MANAGER' }
    if (!skip.is_skip_quality) return { status: 'PENDING_QUALITY_CHECK', stage: 'QUALITY_FINAL_CHECK' }
    return { status: 'RELEASED', stage: 'QUALITY_FINAL_CHECK' }
  }
  if (currentStage === 'PROJECT_MANAGER') {
    return { status: 'PENDING_DESIGN_MEETING', stage: 'DESIGN_ENGINEER_MEETING' }
  }
  if (currentStage === 'DESIGN_ENGINEER_MEETING') {
    if (!skip.is_skip_quality) return { status: 'PENDING_QUALITY_CHECK', stage: 'QUALITY_FINAL_CHECK' }
    return { status: 'RELEASED', stage: 'QUALITY_FINAL_CHECK' }
  }
  if (currentStage === 'QUALITY_FINAL_CHECK') {
    return { status: 'RELEASED', stage: 'QUALITY_FINAL_CHECK' }
  }
  return { status: 'RELEASED', stage: 'QUALITY_FINAL_CHECK' }
}

function getReturnedStatus(targetStage: StageType): ECRStatus {
  const map: Record<StageType, ECRStatus> = {
    DESIGN_ENGINEER_INITIAL: 'RETURNED_TO_DESIGN',
    COSTING: 'RETURNED_TO_COSTING',
    PROJECT_MANAGER: 'RETURNED_TO_PROJECT_MANAGER',
    DESIGN_ENGINEER_MEETING: 'RETURNED_TO_DESIGN',
    QUALITY_FINAL_CHECK: 'RETURNED_TO_DESIGN',
  }
  return map[targetStage] || 'RETURNED_TO_DESIGN'
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, userId, stage, remark, returnToStage, formData } = body

    // Get current ECR
    const [ecr] = await sql`SELECT * FROM ecrs WHERE id = ${id}`
    if (!ecr) return NextResponse.json({ error: 'ECR not found' }, { status: 404 })

    const fromStatus = ecr.status

    if (action === 'submit_stage1') {
      // Submit Stage 1 — move to next stage
      const { status: nextStatus, stage: nextStage } = await getNextStatus(id, 'DESIGN_ENGINEER_INITIAL')

      // Update design initial form
      if (formData) {
        await sql`
          UPDATE design_initial_forms SET
            customer_cr_number = ${formData.customer_cr_number || null},
            cr_received_on = ${formData.cr_received_on},
            cr_by = ${formData.cr_by},
            change_description = ${formData.change_description},
            ecr_sheet_filled_on = ${formData.ecr_sheet_filled_on || null},
            is_skip_costing = ${formData.is_skip_costing || false},
            is_skip_project_manager = ${formData.is_skip_project_manager || false},
            is_skip_quality = ${formData.is_skip_quality || false},
            flow_status = 'PROCEED'::"ECRFlowStatus",
            submitted_at = NOW(),
            updated_at = NOW()
          WHERE ecr_id = ${id}
        `
      }

      // Record history
      await sql`
        INSERT INTO stage_histories (ecr_id, stage, from_status, to_status, flow_status, acted_by_user_id, remark)
        VALUES (${id}, 'DESIGN_ENGINEER_INITIAL'::"StageType", ${fromStatus}::"ECRStatus", ${nextStatus}::"ECRStatus", 'PROCEED'::"ECRFlowStatus", ${userId}, ${remark || null})
      `

      // Record skipped stages
      if (formData?.is_skip_costing) {
        await sql`
          INSERT INTO stage_histories (ecr_id, stage, from_status, to_status, flow_status, acted_by_user_id, is_skip)
          VALUES (${id}, 'COSTING'::"StageType", ${fromStatus}::"ECRStatus", ${nextStatus}::"ECRStatus", 'SKIPPED'::"ECRFlowStatus", ${userId}, true)
        `
      }

      // Advance ECR
      const releaseAt = nextStatus === 'RELEASED' ? sql`NOW()` : sql`NULL`
      await sql`
        UPDATE ecrs SET
          status = ${nextStatus}::"ECRStatus",
          current_stage = ${nextStage}::"StageType",
          released_at = CASE WHEN ${nextStatus} = 'RELEASED' THEN NOW() ELSE released_at END,
          updated_at = NOW()
        WHERE id = ${id}
      `

      return NextResponse.json({ success: true, newStatus: nextStatus })
    }

    if (action === 'save_stage1') {
      // Save draft
      if (formData) {
        await sql`
          UPDATE design_initial_forms SET
            customer_cr_number = ${formData.customer_cr_number || null},
            cr_received_on = ${formData.cr_received_on},
            cr_by = ${formData.cr_by},
            change_description = ${formData.change_description},
            ecr_sheet_filled_on = ${formData.ecr_sheet_filled_on || null},
            is_skip_costing = ${formData.is_skip_costing || false},
            is_skip_project_manager = ${formData.is_skip_project_manager || false},
            is_skip_quality = ${formData.is_skip_quality || false},
            updated_at = NOW()
          WHERE ecr_id = ${id}
        `
      }
      return NextResponse.json({ success: true })
    }

    if (action === 'process_costing') {
      // Update costing form
      if (formData) {
        const existing = await sql`SELECT id FROM costing_forms WHERE ecr_id = ${id}`
        if (existing.length > 0) {
          await sql`
            UPDATE costing_forms SET
              costing_engineer_id = ${formData.costing_engineer_id || null},
              date_of_quote = ${formData.date_of_quote || null},
              offer_to_customer_date = ${formData.offer_to_customer_date || null},
              has_nrc_cost = ${formData.has_nrc_cost || false},
              nrc_amount = ${formData.nrc_amount ? parseFloat(formData.nrc_amount) : null},
              has_rc_cost = ${formData.has_rc_cost || false},
              rc_amount = ${formData.rc_amount ? parseFloat(formData.rc_amount) : null},
              currency = ${formData.currency || 'EUR'},
              cost_details = ${formData.cost_details || null},
              remark = ${remark || null},
              flow_status = 'PROCEED'::"ECRFlowStatus",
              processed_on = NOW(),
              submitted_at = NOW(),
              updated_at = NOW()
            WHERE ecr_id = ${id}
          `
        } else {
          await sql`
            INSERT INTO costing_forms (ecr_id, costing_engineer_id, date_of_quote, has_nrc_cost, nrc_amount, has_rc_cost, rc_amount, currency, cost_details, remark, flow_status, processed_on, submitted_at)
            VALUES (${id}, ${formData.costing_engineer_id || null}, ${formData.date_of_quote || null}, ${formData.has_nrc_cost || false}, ${formData.nrc_amount ? parseFloat(formData.nrc_amount) : null}, ${formData.has_rc_cost || false}, ${formData.rc_amount ? parseFloat(formData.rc_amount) : null}, ${formData.currency || 'EUR'}, ${formData.cost_details || null}, ${remark || null}, 'PROCEED'::"ECRFlowStatus", NOW(), NOW())
          `
        }
      }

      const { status: nextStatus, stage: nextStage } = await getNextStatus(id, 'COSTING')
      await sql`
        INSERT INTO stage_histories (ecr_id, stage, from_status, to_status, flow_status, acted_by_user_id, remark)
        VALUES (${id}, 'COSTING'::"StageType", ${fromStatus}::"ECRStatus", ${nextStatus}::"ECRStatus", 'PROCEED'::"ECRFlowStatus", ${userId}, ${remark || null})
      `
      await sql`
        UPDATE ecrs SET status = ${nextStatus}::"ECRStatus", current_stage = ${nextStage}::"StageType",
        released_at = CASE WHEN ${nextStatus} = 'RELEASED' THEN NOW() ELSE released_at END,
        updated_at = NOW() WHERE id = ${id}
      `
      return NextResponse.json({ success: true, newStatus: nextStatus })
    }

    if (action === 'process_pm') {
      if (formData) {
        const existing = await sql`SELECT id FROM project_manager_forms WHERE ecr_id = ${id}`
        if (existing.length > 0) {
          await sql`
            UPDATE project_manager_forms SET
              po_receipt_date = ${formData.po_receipt_date || null},
              roa = ${formData.roa || null},
              pm_notes = ${formData.pm_notes || null},
              remark = ${remark || null},
              flow_status = 'PROCEED'::"ECRFlowStatus",
              processed_on = NOW(),
              submitted_at = NOW(),
              updated_at = NOW()
            WHERE ecr_id = ${id}
          `
        } else {
          await sql`
            INSERT INTO project_manager_forms (ecr_id, po_receipt_date, roa, pm_notes, remark, flow_status, processed_on, submitted_at)
            VALUES (${id}, ${formData.po_receipt_date || null}, ${formData.roa || null}, ${formData.pm_notes || null}, ${remark || null}, 'PROCEED'::"ECRFlowStatus", NOW(), NOW())
          `
        }
      }

      const { status: nextStatus, stage: nextStage } = await getNextStatus(id, 'PROJECT_MANAGER')
      await sql`
        INSERT INTO stage_histories (ecr_id, stage, from_status, to_status, flow_status, acted_by_user_id, remark)
        VALUES (${id}, 'PROJECT_MANAGER'::"StageType", ${fromStatus}::"ECRStatus", ${nextStatus}::"ECRStatus", 'PROCEED'::"ECRFlowStatus", ${userId}, ${remark || null})
      `
      await sql`UPDATE ecrs SET status = ${nextStatus}::"ECRStatus", current_stage = ${nextStage}::"StageType", updated_at = NOW() WHERE id = ${id}`
      return NextResponse.json({ success: true, newStatus: nextStatus })
    }

    if (action === 'process_meeting') {
      if (formData) {
        const existing = await sql`SELECT id FROM design_meeting_forms WHERE ecr_id = ${id}`
        if (existing.length > 0) {
          await sql`
            UPDATE design_meeting_forms SET
              meeting_date = ${formData.meeting_date || null},
              epicor_release_date = ${formData.epicor_release_date || null},
              ern_release_date = ${formData.ern_release_date || null},
              meeting_notes = ${formData.meeting_notes || null},
              is_not_applicable = ${formData.is_not_applicable || false},
              remark = ${remark || null},
              flow_status = 'PROCEED'::"ECRFlowStatus",
              processed_on = NOW(),
              submitted_at = NOW(),
              updated_at = NOW()
            WHERE ecr_id = ${id}
          `
          // Add attendees
          if (formData.attendees?.length > 0) {
            const [meetingForm] = await sql`SELECT id FROM design_meeting_forms WHERE ecr_id = ${id}`
            await sql`DELETE FROM meeting_attendees WHERE meeting_form_id = ${meetingForm.id}`
            for (const att of formData.attendees) {
              await sql`
                INSERT INTO meeting_attendees (meeting_form_id, name, email, is_external)
                VALUES (${meetingForm.id}, ${att.name}, ${att.email || null}, ${att.is_external || false})
              `
            }
          }
        } else {
          const [newForm] = await sql`
            INSERT INTO design_meeting_forms (ecr_id, meeting_date, epicor_release_date, ern_release_date, meeting_notes, is_not_applicable, remark, flow_status, processed_on, submitted_at)
            VALUES (${id}, ${formData.meeting_date || null}, ${formData.epicor_release_date || null}, ${formData.ern_release_date || null}, ${formData.meeting_notes || null}, ${formData.is_not_applicable || false}, ${remark || null}, 'PROCEED'::"ECRFlowStatus", NOW(), NOW())
            RETURNING id
          `
          if (formData.attendees?.length > 0) {
            for (const att of formData.attendees) {
              await sql`
                INSERT INTO meeting_attendees (meeting_form_id, name, email, is_external)
                VALUES (${newForm.id}, ${att.name}, ${att.email || null}, ${att.is_external || false})
              `
            }
          }
        }
      }

      const { status: nextStatus, stage: nextStage } = await getNextStatus(id, 'DESIGN_ENGINEER_MEETING')
      await sql`
        INSERT INTO stage_histories (ecr_id, stage, from_status, to_status, flow_status, acted_by_user_id, remark)
        VALUES (${id}, 'DESIGN_ENGINEER_MEETING'::"StageType", ${fromStatus}::"ECRStatus", ${nextStatus}::"ECRStatus", 'PROCEED'::"ECRFlowStatus", ${userId}, ${remark || null})
      `
      await sql`
        UPDATE ecrs SET status = ${nextStatus}::"ECRStatus", current_stage = ${nextStage}::"StageType",
        released_at = CASE WHEN ${nextStatus} = 'RELEASED' THEN NOW() ELSE released_at END,
        updated_at = NOW() WHERE id = ${id}
      `
      return NextResponse.json({ success: true, newStatus: nextStatus })
    }

    if (action === 'release_quality') {
      if (formData) {
        const existing = await sql`SELECT id FROM quality_check_forms WHERE ecr_id = ${id}`
        if (existing.length > 0) {
          await sql`
            UPDATE quality_check_forms SET
              quality_engineer_id = ${formData.quality_engineer_id || null},
              verification_result = ${formData.verification_result || null},
              verified_in_train_set = ${formData.verified_in_train_set || null},
              verification_date = ${formData.verification_date || null},
              findings = ${formData.findings || null},
              remark = ${remark || null},
              flow_status = 'PROCEED'::"ECRFlowStatus",
              processed_on = NOW(),
              submitted_at = NOW(),
              updated_at = NOW()
            WHERE ecr_id = ${id}
          `
        } else {
          await sql`
            INSERT INTO quality_check_forms (ecr_id, quality_engineer_id, verification_result, verified_in_train_set, verification_date, findings, remark, flow_status, processed_on, submitted_at)
            VALUES (${id}, ${formData.quality_engineer_id || null}, ${formData.verification_result || null}, ${formData.verified_in_train_set || null}, ${formData.verification_date || null}, ${formData.findings || null}, ${remark || null}, 'PROCEED'::"ECRFlowStatus", NOW(), NOW())
          `
        }
      }

      await sql`
        INSERT INTO stage_histories (ecr_id, stage, from_status, to_status, flow_status, acted_by_user_id, remark)
        VALUES (${id}, 'QUALITY_FINAL_CHECK'::"StageType", ${fromStatus}::"ECRStatus", 'RELEASED'::"ECRStatus", 'PROCEED'::"ECRFlowStatus", ${userId}, ${remark || null})
      `
      await sql`UPDATE ecrs SET status = 'RELEASED'::"ECRStatus", released_at = NOW(), updated_at = NOW() WHERE id = ${id}`
      return NextResponse.json({ success: true, newStatus: 'RELEASED' })
    }

    if (action === 'return') {
      const targetStage: StageType = returnToStage || 'DESIGN_ENGINEER_INITIAL'
      const returnedStatus = getReturnedStatus(targetStage)

      await sql`
        INSERT INTO stage_histories (ecr_id, stage, from_status, to_status, flow_status, acted_by_user_id, remark, returned_to_stage)
        VALUES (${id}, ${stage}::"StageType", ${fromStatus}::"ECRStatus", ${returnedStatus}::"ECRStatus", 'RETURNED'::"ECRFlowStatus", ${userId}, ${remark || null}, ${targetStage}::"StageType")
      `
      await sql`
        UPDATE ecrs SET status = ${returnedStatus}::"ECRStatus", current_stage = ${targetStage}::"StageType", updated_at = NOW() WHERE id = ${id}
      `
      return NextResponse.json({ success: true, newStatus: returnedStatus })
    }

    if (action === 'hold') {
      await sql`
        INSERT INTO stage_histories (ecr_id, stage, from_status, to_status, flow_status, acted_by_user_id, remark)
        VALUES (${id}, ${ecr.current_stage}::"StageType", ${fromStatus}::"ECRStatus", 'ON_HOLD'::"ECRStatus", 'PENDING'::"ECRFlowStatus", ${userId}, ${remark || null})
      `
      await sql`UPDATE ecrs SET status = 'ON_HOLD'::"ECRStatus", updated_at = NOW() WHERE id = ${id}`
      return NextResponse.json({ success: true, newStatus: 'ON_HOLD' })
    }

    if (action === 'cancel') {
      await sql`
        INSERT INTO stage_histories (ecr_id, stage, from_status, to_status, flow_status, acted_by_user_id, remark)
        VALUES (${id}, ${ecr.current_stage}::"StageType", ${fromStatus}::"ECRStatus", 'CANCELLED'::"ECRStatus", 'PENDING'::"ECRFlowStatus", ${userId}, ${remark || null})
      `
      await sql`UPDATE ecrs SET status = 'CANCELLED'::"ECRStatus", updated_at = NOW() WHERE id = ${id}`
      return NextResponse.json({ success: true, newStatus: 'CANCELLED' })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('[ECR Stage Action]', error)
    return NextResponse.json({ error: 'Failed to process action' }, { status: 500 })
  }
}

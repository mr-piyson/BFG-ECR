'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ECRStatus, StageType, ECRFlowStatus } from '@prisma/client';
import { auth } from '@/auth';

// ---------------------------------------------------------
// RECONFIGURED HELPER: GET NEXT STAGE
// ---------------------------------------------------------
async function getNextStage(ecrId: string, currentStage: StageType): Promise<{ status: ECRStatus; stage: StageType }> {
  const dif = await prisma.designInitialForm.findUnique({ where: { ecrId } });
  
  const skip = {
    costing: dif?.isSkipCosting || false,
    pm: dif?.isSkipProjectManager || false,
    meeting: dif?.isSkipMeeting || false,
    quality: dif?.isSkipQuality || false,
  };

  if (currentStage === 'DESIGN_ENGINEER_INITIAL') {
    if (!skip.costing) return { status: 'PENDING_COSTING', stage: 'COSTING' };
    if (!skip.pm) return { status: 'PENDING_PROJECT_MANAGER', stage: 'PROJECT_MANAGER' };
    if (!skip.meeting) return { status: 'PENDING_DESIGN_MEETING', stage: 'DESIGN_ENGINEER_MEETING' };
    if (!skip.quality) return { status: 'PENDING_QUALITY_CHECK', stage: 'QUALITY_FINAL_CHECK' };
    return { status: 'RELEASED', stage: 'QUALITY_FINAL_CHECK' };
  }

  if (currentStage === 'COSTING') {
    if (!skip.pm) return { status: 'PENDING_PROJECT_MANAGER', stage: 'PROJECT_MANAGER' };
    if (!skip.meeting) return { status: 'PENDING_DESIGN_MEETING', stage: 'DESIGN_ENGINEER_MEETING' };
    if (!skip.quality) return { status: 'PENDING_QUALITY_CHECK', stage: 'QUALITY_FINAL_CHECK' };
    return { status: 'RELEASED', stage: 'QUALITY_FINAL_CHECK' };
  }

  if (currentStage === 'PROJECT_MANAGER') {
    if (!skip.meeting) return { status: 'PENDING_DESIGN_MEETING', stage: 'DESIGN_ENGINEER_MEETING' };
    if (!skip.quality) return { status: 'PENDING_QUALITY_CHECK', stage: 'QUALITY_FINAL_CHECK' };
    return { status: 'RELEASED', stage: 'QUALITY_FINAL_CHECK' };
  }

  if (currentStage === 'DESIGN_ENGINEER_MEETING') {
    if (!skip.quality) return { status: 'PENDING_QUALITY_CHECK', stage: 'QUALITY_FINAL_CHECK' };
    return { status: 'RELEASED', stage: 'QUALITY_FINAL_CHECK' };
  }

  return { status: 'RELEASED', stage: 'QUALITY_FINAL_CHECK' };
}

// ---------------------------------------------------------
// STAGE 1: DESIGN INITIAL
// ---------------------------------------------------------
export async function submitDesignInitial(ecrId: string, formData: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const userId = session.user.id;

  await prisma.designInitialForm.upsert({
    where: { ecrId },
    update: {
      customerCrNumber: formData.customer_cr_number,
      crReceivedOn: new Date(formData.cr_received_on),
      changeDescription: formData.change_description,
      crBy: formData.cr_by || session.user.name || 'Unknown',
      isSkipCosting: formData.is_skip_costing,
      isSkipProjectManager: formData.is_skip_project_manager,
      isSkipMeeting: formData.is_skip_meeting,
      isSkipQuality: formData.is_skip_quality,
      flowStatus: 'PROCEED',
    },
    create: {
      ecrId,
      customerCrNumber: formData.customer_cr_number,
      crReceivedOn: new Date(formData.cr_received_on),
      changeDescription: formData.change_description,
      crBy: formData.cr_by || session.user.name || 'Unknown',
      isSkipCosting: formData.is_skip_costing,
      isSkipProjectManager: formData.is_skip_project_manager,
      isSkipMeeting: formData.is_skip_meeting,
      isSkipQuality: formData.is_skip_quality,
      flowStatus: 'PROCEED',
    },
  });

  const next = await getNextStage(ecrId, 'DESIGN_ENGINEER_INITIAL');
  await prisma.stageHistory.create({
    data: {
      ecrId, stage: 'DESIGN_ENGINEER_INITIAL', fromStatus: 'DRAFT', toStatus: next.status,
      flowStatus: 'PROCEED', actedByUserId: userId, remark: formData.remark || 'Stage 1 Completed'
    },
  });

  await prisma.ecr.update({
    where: { id: ecrId },
    data: { status: next.status, currentStage: next.stage, updatedAt: new Date() },
  });

  revalidatePath(`/ecrs/${ecrId}`);
  return { success: true };
}

// ---------------------------------------------------------
// STAGE 2: COSTING
// ---------------------------------------------------------
export async function submitCosting(ecrId: string, formData: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const userId = session.user.id;

  await prisma.costingForm.upsert({
    where: { ecrId },
    update: {
      costingEngineerId: userId,
      nrcAmount: formData.nrcAmount,
      rcAmount: formData.rcAmount,
      currency: formData.currency || 'EUR',
      remark: formData.remark,
      flowStatus: 'PROCEED',
      submittedAt: new Date(),
    },
    create: {
      ecrId,
      costingEngineerId: userId,
      nrcAmount: formData.nrcAmount,
      rcAmount: formData.rcAmount,
      currency: formData.currency || 'EUR',
      remark: formData.remark,
      flowStatus: 'PROCEED',
      submittedAt: new Date(),
    },
  });

  const next = await getNextStage(ecrId, 'COSTING');
  await prisma.stageHistory.create({
    data: {
      ecrId, stage: 'COSTING', fromStatus: 'PENDING_COSTING', toStatus: next.status,
      flowStatus: 'PROCEED', actedByUserId: userId, remark: formData.remark || 'Costing Completed'
    },
  });

  await prisma.ecr.update({
    where: { id: ecrId },
    data: { status: next.status, currentStage: next.stage, updatedAt: new Date() },
  });

  revalidatePath(`/ecrs/${ecrId}`);
  return { success: true };
}

// ---------------------------------------------------------
// STAGE 3: PROJECT MANAGER
// ---------------------------------------------------------
export async function submitPM(ecrId: string, formData: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const userId = session.user.id;

  await prisma.projectManagerForm.upsert({
    where: { ecrId },
    update: {
      poReceiptDate: formData.po_receipt_date ? new Date(formData.po_receipt_date) : null,
      roa: formData.roa,
      pmNotes: formData.pm_notes,
      remark: formData.remark,
      flowStatus: 'PROCEED',
      submittedAt: new Date(),
    },
    create: {
      ecrId,
      poReceiptDate: formData.po_receipt_date ? new Date(formData.po_receipt_date) : null,
      roa: formData.roa,
      pmNotes: formData.pm_notes,
      remark: formData.remark,
      flowStatus: 'PROCEED',
      submittedAt: new Date(),
    },
  });

  const next = await getNextStage(ecrId, 'PROJECT_MANAGER');
  await prisma.stageHistory.create({
    data: {
      ecrId, stage: 'PROJECT_MANAGER', fromStatus: 'PENDING_PROJECT_MANAGER', toStatus: next.status,
      flowStatus: 'PROCEED', actedByUserId: userId, remark: formData.remark || 'PM Approval Completed'
    },
  });

  await prisma.ecr.update({
    where: { id: ecrId },
    data: { status: next.status, currentStage: next.stage, updatedAt: new Date() },
  });

  revalidatePath(`/ecrs/${ecrId}`);
  return { success: true };
}

// ---------------------------------------------------------
// STAGE 4: DESIGN MEETING
// ---------------------------------------------------------
export async function submitMeeting(ecrId: string, formData: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const userId = session.user.id;

  await prisma.designMeetingForm.upsert({
    where: { ecrId },
    update: {
      meetingDate: formData.meeting_date ? new Date(formData.meeting_date) : null,
      epicorReleaseDate: formData.epicor_release_date ? new Date(formData.epicor_release_date) : null,
      ernReleaseDate: formData.ern_release_date ? new Date(formData.ern_release_date) : null,
      meetingNotes: formData.meeting_notes,
      flowStatus: 'PROCEED',
      submittedAt: new Date(),
    },
    create: {
      ecrId,
      meetingDate: formData.meeting_date ? new Date(formData.meeting_date) : null,
      epicorReleaseDate: formData.epicor_release_date ? new Date(formData.epicor_release_date) : null,
      ernReleaseDate: formData.ern_release_date ? new Date(formData.ern_release_date) : null,
      meetingNotes: formData.meeting_notes,
      flowStatus: 'PROCEED',
      submittedAt: new Date(),
    },
  });

  const next = await getNextStage(ecrId, 'DESIGN_ENGINEER_MEETING');
  await prisma.stageHistory.create({
    data: {
      ecrId, stage: 'DESIGN_ENGINEER_MEETING', fromStatus: 'PENDING_DESIGN_MEETING', toStatus: next.status,
      flowStatus: 'PROCEED', actedByUserId: userId, remark: formData.remark || 'Design Meeting Completed'
    },
  });

  await prisma.ecr.update({
    where: { id: ecrId },
    data: { status: next.status, currentStage: next.stage, updatedAt: new Date() },
  });

  revalidatePath(`/ecrs/${ecrId}`);
  return { success: true };
}

// ---------------------------------------------------------
// STAGE 5: QUALITY CHECK
// ---------------------------------------------------------
export async function submitQuality(ecrId: string, formData: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const userId = session.user.id;

  await prisma.qualityCheckForm.upsert({
    where: { ecrId },
    update: {
      qualityEngineerId: userId,
      verificationResult: formData.verification_result,
      verifiedInTrainSet: formData.verified_in_train_set,
      verificationDate: formData.verification_date ? new Date(formData.verification_date) : null,
      findings: formData.findings,
      flowStatus: 'PROCEED',
      submittedAt: new Date(),
    },
    create: {
      ecrId,
      qualityEngineerId: userId,
      verificationResult: formData.verification_result,
      verifiedInTrainSet: formData.verified_in_train_set,
      verificationDate: formData.verification_date ? new Date(formData.verification_date) : null,
      findings: formData.findings,
      flowStatus: 'PROCEED',
      submittedAt: new Date(),
    },
  });

  await prisma.stageHistory.create({
    data: {
      ecrId, stage: 'QUALITY_FINAL_CHECK', fromStatus: 'PENDING_QUALITY_CHECK', toStatus: 'RELEASED',
      flowStatus: 'PROCEED', actedByUserId: userId, remark: formData.remark || 'Quality Check Completed'
    },
  });

  await prisma.ecr.update({
    where: { id: ecrId },
    data: { status: 'RELEASED', releasedAt: new Date(), updatedAt: new Date() },
  });

  revalidatePath(`/ecrs/${ecrId}`);
  return { success: true };
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const ecr = await prisma.ecr.findUnique({
      where: { id },
      include: {
        project: true,
        scopes: true,
        designEngineer: { select: { id: true, name: true, email: true, role: true } },
        projectEngineer: { select: { id: true, name: true, email: true, role: true } },
        designInitialForm: true,
        costingForm: true,
        projectManagerForm: true,
        designMeetingForm: {
          include: { attendees: { orderBy: { name: 'asc' } } },
        },
        qualityCheckForm: true,
        stageHistories: {
          include: {
            actedByUser: { select: { name: true, role: true, email: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        attachments: { orderBy: { uploadedAt: 'desc' } },
      },
    });

    if (!ecr) {
      return NextResponse.json({ error: 'ECR not found' }, { status: 404 });
    }

    // Transform for UI (maintaining field names used in existing components)
    const transformedEcr = {
      ...ecr,
      project_code: ecr.project.code,
      project_name: ecr.project.name,
      project_description: ecr.project.description,
      design_engineer_name: ecr.designEngineer.name,
      design_engineer_email: ecr.designEngineer.email,
      design_engineer_role: ecr.designEngineer.role,
      project_engineer_name: ecr.projectEngineer?.name,
      project_engineer_email: ecr.projectEngineer?.email,
      // Concatenate scopes for simple labels
      scope_name: ecr.scopes.map((s) => s.name).join(', '),
    };

    return NextResponse.json({
      ecr: transformedEcr,
      design_initial_form: ecr.designInitialForm,
      costing_form: ecr.costingForm,
      project_manager_form: ecr.projectManagerForm,
      design_meeting_form: ecr.designMeetingForm,
      quality_check_form: ecr.qualityCheckForm,
      stage_histories: ecr.stageHistories.map((sh) => ({
        ...sh,
        acted_by_name: sh.actedByUser.name,
        acted_by_role: sh.actedByUser.role,
        acted_by_email: sh.actedByUser.email,
      })),
      attachments: ecr.attachments,
    });
  } catch (error) {
    console.error('[ECR Detail API]', error);
    return NextResponse.json({ error: 'Failed to load ECR' }, { status: 500 });
  }
}

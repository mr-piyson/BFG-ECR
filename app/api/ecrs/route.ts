import { NextResponse } from 'next/server';
import sql, { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const ecrs = await prisma.ecr.findMany({
      where: {
        AND: [
          projectId ? { projectId } : {},
          status ? { status: status as any } : {},
          search
            ? {
                OR: [
                  { ecrNumber: isNaN(parseInt(search)) ? undefined : parseInt(search) },
                  { project: { code: { contains: search, mode: 'insensitive' } } },
                  { project: { name: { contains: search, mode: 'insensitive' } } },
                  {
                    designInitialForm: {
                      changeDescription: { contains: search, mode: 'insensitive' },
                    },
                  },
                ],
              }
            : {},
        ],
      },
      include: {
        project: true,
        scopes: true,
        designEngineer: true,
        designInitialForm: {
          select: {
            changeDescription: true,
            customerCrNumber: true,
            flowStatus: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const transformed = ecrs.map((e) => ({
      ...e,
      project_code: e.project.code,
      project_name: e.project.name,
      design_engineer_name: e.designEngineer.name,
      change_description: e.designInitialForm?.changeDescription,
      scope_name: e.scopes.map((s) => (s as any).name).join(', '),
    }));

    return NextResponse.json({ ecrs: transformed, total: transformed.length });
  } catch (error) {
    console.error('[ECR List API]', error);
    return NextResponse.json({ error: 'Failed to load ECRs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      project_id,
      scope_ids,
      source = 'CUSTOMER',
      design_engineer_id,
      project_engineer_id,
      customer_cr_number,
      cr_received_on,
      cr_by,
      change_description,
      is_skip_costing = false,
      is_skip_project_manager = false,
      is_skip_meeting = false,
      is_skip_quality = false,
    } = body;

    if (!project_id || !design_engineer_id || !cr_received_on || !cr_by || !change_description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const ecr = await prisma.ecr.create({
      data: {
        projectId: project_id,
        scopes: {
          connect: (scope_ids || []).map((id: string) => ({ id })),
        },
        source: source,
        status: 'DRAFT',
        currentStage: 'DESIGN_ENGINEER_INITIAL',
        designEngineerId: design_engineer_id,
        projectEngineerId: project_engineer_id || null,
        designInitialForm: {
          create: {
            customerCrNumber: customer_cr_number || null,
            crReceivedOn: new Date(cr_received_on),
            crBy: cr_by,
            changeDescription: change_description,
            isSkipCosting: is_skip_costing,
            isSkipProjectManager: is_skip_project_manager,
            isSkipMeeting: is_skip_meeting,
            isSkipQuality: is_skip_quality,
            flowStatus: 'PENDING',
          },
        },
      },
      include: {
        designInitialForm: true,
        scopes: true,
      },
    });

    return NextResponse.json({ ecr }, { status: 201 });
  } catch (error) {
    console.error('[ECR Create API]', error);
    return NextResponse.json({ error: 'Failed to create ECR' }, { status: 500 });
  }
}

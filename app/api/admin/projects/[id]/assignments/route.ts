import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { adminGuard } from '@/lib/admin-guard';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    const { id } = await params;
    const assignments = await prisma.projectAssignment.findMany({
      where: { projectId: id },
      include: {
        user: true,
      },
      orderBy: { assignedAt: 'desc' },
    });
    return NextResponse.json(assignments);
  } catch (error) {
    console.error('[Admin Assignments API]', error);
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, role, isPrimary } = body;

    if (!userId || !role) {
      return NextResponse.json({ error: 'User and role are required' }, { status: 400 });
    }

    const assignment = await prisma.projectAssignment.create({
      data: {
        projectId: id,
        userId,
        role,
        isPrimary: isPrimary ?? false,
      },
      include: { user: true },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'User already has this role in this project' },
        { status: 400 },
      );
    }
    console.error('[Admin Assignments API]', error);
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
  }
}

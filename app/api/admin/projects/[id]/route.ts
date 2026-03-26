import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { adminGuard } from '@/lib/admin-guard';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    const { id } = await params;
    const body = await request.json();
    const { code, name, description, isActive } = body;

    if (!code || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        code,
        name,
        description: description || null,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(project);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    console.error('[Admin Projects API]', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    const { id } = await params;
    await prisma.project.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin Projects API]', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}

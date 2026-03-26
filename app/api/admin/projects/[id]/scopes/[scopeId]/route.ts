import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { adminGuard } from '@/lib/admin-guard';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; scopeId: string }> },
) {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    const { scopeId } = await params;
    const body = await request.json();
    const { name, description, isActive } = body;

    const scope = await prisma.projectScope.update({
      where: { id: scopeId },
      data: {
        name,
        description: description || null,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(scope);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Scope not found' }, { status: 404 });
    }
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Scope name already exists for this project' },
        { status: 400 },
      );
    }
    console.error('[Admin Scopes API]', error);
    return NextResponse.json({ error: 'Failed to update scope' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; scopeId: string }> },
) {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    const { scopeId } = await params;
    await prisma.projectScope.delete({
      where: { id: scopeId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin Scopes API]', error);
    return NextResponse.json({ error: 'Failed to delete scope' }, { status: 500 });
  }
}

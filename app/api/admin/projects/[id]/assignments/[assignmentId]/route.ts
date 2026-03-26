import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { adminGuard } from '@/lib/admin-guard';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; assignmentId: string }> },
) {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    const { assignmentId } = await params;
    await prisma.projectAssignment.delete({
      where: { id: assignmentId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin Assignments API]', error);
    return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 });
  }
}

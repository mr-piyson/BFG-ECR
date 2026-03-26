import { auth } from '@/auth';
import { UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function adminGuard() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: 'Forbidden: Admin access only' }, { status: 403 });
  }

  return null; // All good
}

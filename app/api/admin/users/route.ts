import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { adminGuard } from '@/lib/admin-guard';
import bcrypt from 'bcryptjs';

export async function GET() {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('[Admin Users API]', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    const body = await request.json();
    const { name, email, role, department, isActive, password } = body;

    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Default password if not provided
    const defaultPassword = password || 'BFG@123456';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        department: department || null,
        isActive: isActive ?? true,
        password: hashedPassword,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('[Admin Users API]', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

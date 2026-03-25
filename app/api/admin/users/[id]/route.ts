import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminGuard } from "@/lib/admin-guard";
import bcrypt from "bcryptjs";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, role, department, isActive, password } = body;

    const updateData: any = {
      name,
      email,
      role,
      department: department || null,
      isActive: isActive ?? true,
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(user);
  } catch (error: any) {
    if (error.code === 'P2025') {
       return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.error("[Admin Users API]", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    const { id } = await params;
    await prisma.user.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Users API]", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

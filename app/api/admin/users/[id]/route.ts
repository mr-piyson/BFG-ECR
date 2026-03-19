import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, role, department, is_active } = body;

    if (!name || !email || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [user] = await sql`
      UPDATE users
      SET name = ${name}, email = ${email}, role = ${role}, department = ${department || null}, is_active = ${is_active ?? true}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("[Admin Users API]", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await sql`DELETE FROM users WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Users API]", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { code, name, description, is_active } = body;

    if (!code || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [project] = await sql`
      UPDATE projects
      SET code = ${code}, name = ${name}, description = ${description || null}, is_active = ${is_active ?? true}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("[Admin Projects API]", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await sql`DELETE FROM projects WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Projects API]", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}

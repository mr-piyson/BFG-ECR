import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  try {
    const projects = await sql`
      SELECT * FROM projects
      ORDER BY created_at DESC
    `;
    return NextResponse.json(projects);
  } catch (error) {
    console.error("[Admin Projects API]", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, description, is_active } = body;

    if (!code || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [project] = await sql`
      INSERT INTO projects (code, name, description, is_active)
      VALUES (${code}, ${name}, ${description || null}, ${is_active ?? true})
      RETURNING *
    `;

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("[Admin Projects API]", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}

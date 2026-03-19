import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  try {
    const users = await sql`
      SELECT * FROM users
      ORDER BY created_at DESC
    `;
    return NextResponse.json(users);
  } catch (error) {
    console.error("[Admin Users API]", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, role, department, is_active } = body;

    if (!name || !email || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [user] = await sql`
      INSERT INTO users (name, email, role, department, is_active)
      VALUES (${name}, ${email}, ${role}, ${department || null}, ${is_active ?? true})
      RETURNING *
    `;

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("[Admin Users API]", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

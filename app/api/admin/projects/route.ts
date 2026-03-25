import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminGuard } from "@/lib/admin-guard";

export async function GET() {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error("[Admin Projects API]", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    const body = await request.json();
    const { code, name, description, isActive } = body;

    if (!code || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        code,
        name,
        description: description || null,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("[Admin Projects API]", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}


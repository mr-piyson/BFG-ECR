import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminGuard } from "@/lib/admin-guard";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    const { id } = await params;
    const scopes = await prisma.projectScope.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(scopes);
  } catch (error) {
    console.error("[Admin Scopes API]", error);
    return NextResponse.json({ error: "Failed to fetch scopes" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, isActive } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const scope = await prisma.projectScope.create({
      data: {
        projectId: id,
        name,
        description: description || null,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(scope, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Scope name already exists for this project" }, { status: 400 });
    }
    console.error("[Admin Scopes API]", error);
    return NextResponse.json({ error: "Failed to create scope" }, { status: 500 });
  }
}

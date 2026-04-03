import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function checkAuth(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth || auth !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return false;
  }
  return true;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();

  try {
    const servers = await prisma.server.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { vpnKeys: true } } },
    });

    return NextResponse.json(servers);
  } catch (error) {
    console.error("GET /api/admin/servers failed:", error);
    return NextResponse.json({ error: "Failed to fetch servers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();

  try {
    const { name, apiUrl } = await req.json();

    if (!name || !apiUrl) {
      return NextResponse.json({ error: "Name and API URL are required" }, { status: 400 });
    }

    const server = await prisma.server.create({ data: { name, apiUrl } });
    return NextResponse.json(server, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/servers failed:", error);
    return NextResponse.json({ error: "Failed to create server" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();

  try {
    const { id } = await req.json();
    const server = await prisma.server.findUnique({
      where: { id },
      include: { _count: { select: { vpnKeys: true } } },
    });

    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }
    if (server._count.vpnKeys > 0) {
      return NextResponse.json(
        { error: `Cannot delete server with ${server._count.vpnKeys} active key(s). Delete the keys first.` },
        { status: 400 }
      );
    }

    await prisma.server.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/servers failed:", error);
    return NextResponse.json({ error: "Failed to delete server" }, { status: 500 });
  }
}

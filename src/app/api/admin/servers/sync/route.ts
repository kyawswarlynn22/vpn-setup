import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { listKeys } from "@/lib/outline";

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

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();

  try {
    const { serverId } = await req.json();
    if (!serverId) {
      return NextResponse.json({ error: "Server ID is required" }, { status: 400 });
    }

    const server = await prisma.server.findUnique({ where: { id: serverId } });
    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    const { accessKeys } = await listKeys(server.apiUrl);

    const existingKeys = await prisma.vpnKey.findMany({
      where: { serverId: server.id },
      select: { outlineKeyId: true },
    });
    const existingOutlineIds = new Set(existingKeys.map((k) => k.outlineKeyId));

    const newKeys = accessKeys.filter((k) => !existingOutlineIds.has(String(k.id)));

    if (newKeys.length === 0) {
      return NextResponse.json({ imported: 0, message: "All keys are already synced" });
    }

    const importedUser = await prisma.user.upsert({
      where: { email: "imported@vpn-manager" },
      update: {},
      create: { email: "imported@vpn-manager" },
    });

    const defaultExpiry = new Date(Date.now() + 30 * 86_400_000);

    let imported = 0;
    for (const key of newKeys) {
      const outlineId = String(key.id);
      const compositeKeyId = `${server.name}-${outlineId}`;
      const dataLimit = key.dataLimit?.bytes
        ? BigInt(key.dataLimit.bytes)
        : null;
      try {
        await prisma.vpnKey.create({
          data: {
            keyId: compositeKeyId,
            outlineKeyId: outlineId,
            name: key.name || `Imported-${compositeKeyId}`,
            accessUrl: key.accessUrl,
            userId: importedUser.id,
            serverId: server.id,
            expiresAt: defaultExpiry,
            dataLimit,
          },
        });
        imported++;
      } catch (e) {
        console.warn(`Skipped key ${compositeKeyId} (may already exist):`, e);
      }
    }

    return NextResponse.json({
      imported,
      total: accessKeys.length,
      alreadySynced: existingOutlineIds.size,
      message: `Imported ${imported} new key(s)`,
    });
  } catch (error) {
    console.error("POST /api/admin/servers/sync failed:", error);
    return NextResponse.json({ error: "Failed to sync keys from server" }, { status: 500 });
  }
}

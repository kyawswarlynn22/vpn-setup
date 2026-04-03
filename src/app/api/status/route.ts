import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDataUsage } from "@/lib/outline";

async function autoExpireKeys() {
  await prisma.vpnKey.updateMany({
    where: { status: "ACTIVE", expiresAt: { lte: new Date() } },
    data: { status: "EXPIRED" },
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ error: "Please provide an email or Key ID" }, { status: 400 });
  }

  try {
    await autoExpireKeys();

    const isEmail = query.includes("@");
    let keys;

    if (isEmail) {
      const user = await prisma.user.findUnique({
        where: { email: query },
        include: { vpnKeys: { orderBy: { createdAt: "desc" }, include: { server: true } } },
      });
      if (!user || user.vpnKeys.length === 0) {
        return NextResponse.json({ error: "No keys found for this email" }, { status: 404 });
      }
      keys = user.vpnKeys;
    } else {
      const key = await prisma.vpnKey.findUnique({
        where: { keyId: query },
        include: { server: true },
      });
      if (!key) return NextResponse.json({ error: "Key not found" }, { status: 404 });
      keys = [key];
    }

    const serverIds = [...new Set(keys.map((k) => k.serverId))];
    const servers = await prisma.server.findMany({ where: { id: { in: serverIds } } });

    const usageByServer: Record<string, Record<string, number>> = {};
    await Promise.allSettled(
      servers.map(async (server) => {
        try {
          const usage = await getDataUsage(server.apiUrl);
          usageByServer[server.id] = usage.bytesTransferredByUserId ?? {};
        } catch (e) {
          console.warn(`Could not fetch usage from "${server.name}":`, e);
          usageByServer[server.id] = {};
        }
      })
    );

    const now = new Date();
    const result = keys.map((key) => {
      const bytesUsed = usageByServer[key.serverId]?.[key.outlineKeyId] ?? 0;
      const daysLeft = Math.max(0, Math.ceil((key.expiresAt.getTime() - now.getTime()) / 86_400_000));
      return {
        keyId: key.keyId,
        name: key.name,
        serverName: key.server.name,
        status: key.status,
        dataLimit: key.dataLimit ? Number(key.dataLimit) : null,
        bytesUsed,
        dataUsedGB: Number((bytesUsed / 1_073_741_824).toFixed(2)),
        dataLimitGB: key.dataLimit ? Number((Number(key.dataLimit) / 1_073_741_824).toFixed(2)) : null,
        expiresAt: key.expiresAt,
        daysLeft,
        createdAt: key.createdAt,
      };
    });

    return NextResponse.json({ keys: result });
  } catch (error) {
    console.error("GET /api/status failed:", error);
    return NextResponse.json({ error: "Failed to check status" }, { status: 500 });
  }
}

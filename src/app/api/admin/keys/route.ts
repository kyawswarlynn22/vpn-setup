import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createKey, getDataUsage, deleteKey, renameKey, setDataLimit, removeDataLimit } from "@/lib/outline";

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

async function autoExpireKeys() {
  await prisma.vpnKey.updateMany({
    where: { status: "ACTIVE", expiresAt: { lte: new Date() } },
    data: { status: "EXPIRED" },
  });
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();

  try {
    await autoExpireKeys();

    const keys = await prisma.vpnKey.findMany({
      include: { user: true, server: true },
      orderBy: { createdAt: "desc" },
    });

    const servers = await prisma.server.findMany();
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

    const keysWithUsage = keys.map((key) => ({
      ...key,
      dataLimit: key.dataLimit ? Number(key.dataLimit) : null,
      bytesUsed: usageByServer[key.serverId]?.[key.outlineKeyId] ?? 0,
    }));

    return NextResponse.json(keysWithUsage);
  } catch (error) {
    console.error("GET /api/admin/keys failed:", error);
    return NextResponse.json({ error: "Failed to fetch keys" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();

  try {
    const { email, name, serverId, expiresAt, dataLimitGB } = await req.json();

    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });
    if (!serverId) return NextResponse.json({ error: "Server is required" }, { status: 400 });

    const server = await prisma.server.findUnique({ where: { id: serverId } });
    if (!server) return NextResponse.json({ error: "Server not found" }, { status: 404 });

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    const outlineKey = await createKey(server.apiUrl);
    const compositeKeyId = `${server.name}-${outlineKey.id}`;

    if (name) {
      await renameKey(server.apiUrl, outlineKey.id, name);
    }

    const dataLimitBytes = dataLimitGB && dataLimitGB > 0
      ? BigInt(Math.round(dataLimitGB * 1_073_741_824))
      : null;

    if (dataLimitBytes) {
      await setDataLimit(server.apiUrl, outlineKey.id, Number(dataLimitBytes));
    }

    const expiry = expiresAt
      ? new Date(expiresAt)
      : new Date(Date.now() + 30 * 86_400_000);

    const vpnKey = await prisma.vpnKey.create({
      data: {
        keyId: compositeKeyId,
        outlineKeyId: String(outlineKey.id),
        name: name || `Key-${compositeKeyId}`,
        accessUrl: outlineKey.accessUrl,
        userId: user.id,
        serverId: server.id,
        expiresAt: expiry,
        dataLimit: dataLimitBytes,
      },
      include: { user: true, server: true },
    });

    return NextResponse.json({
      ...vpnKey,
      dataLimit: vpnKey.dataLimit ? Number(vpnKey.dataLimit) : null,
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/keys failed:", error);
    return NextResponse.json({ error: "Failed to create key" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();

  try {
    const { keyId } = await req.json();
    const vpnKey = await prisma.vpnKey.findUnique({
      where: { keyId },
      include: { server: true },
    });
    if (!vpnKey) return NextResponse.json({ error: "Key not found" }, { status: 404 });

    try {
      await deleteKey(vpnKey.server.apiUrl, vpnKey.outlineKeyId);
    } catch (e) {
      console.warn("Could not delete key from Outline:", e);
    }

    await prisma.vpnKey.delete({ where: { keyId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/keys failed:", error);
    return NextResponse.json({ error: "Failed to delete key" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();

  try {
    const { keyId, name, status, expiresAt, newKeyId, email, dataLimitGB } = await req.json();
    const vpnKey = await prisma.vpnKey.findUnique({
      where: { keyId },
      include: { server: true, user: true },
    });
    if (!vpnKey) return NextResponse.json({ error: "Key not found" }, { status: 404 });

    if (name) {
      try { await renameKey(vpnKey.server.apiUrl, vpnKey.outlineKeyId, name); }
      catch (e) { console.warn("Could not rename key in Outline:", e); }
    }

    if (newKeyId && newKeyId !== keyId) {
      const existing = await prisma.vpnKey.findUnique({ where: { keyId: newKeyId } });
      if (existing) {
        return NextResponse.json({ error: `Key ID "${newKeyId}" already exists` }, { status: 409 });
      }
    }

    let userId = vpnKey.userId;
    if (email && email !== vpnKey.user.email) {
      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: { email },
      });
      userId = user.id;
    }

    let dataLimitBytes: bigint | null | undefined = undefined;
    if (dataLimitGB !== undefined) {
      if (dataLimitGB === null || dataLimitGB === 0 || dataLimitGB === "") {
        try { await removeDataLimit(vpnKey.server.apiUrl, vpnKey.outlineKeyId); }
        catch (e) { console.warn("Could not remove data limit in Outline:", e); }
        dataLimitBytes = null;
      } else {
        dataLimitBytes = BigInt(Math.round(Number(dataLimitGB) * 1_073_741_824));
        try { await setDataLimit(vpnKey.server.apiUrl, vpnKey.outlineKeyId, Number(dataLimitBytes)); }
        catch (e) { console.warn("Could not set data limit in Outline:", e); }
      }
    }

    const updated = await prisma.vpnKey.update({
      where: { keyId },
      data: {
        ...(name && { name }),
        ...(status && { status }),
        ...(expiresAt && { expiresAt: new Date(expiresAt) }),
        ...(newKeyId && newKeyId !== keyId && { keyId: newKeyId }),
        ...(dataLimitBytes !== undefined && { dataLimit: dataLimitBytes }),
        userId,
      },
      include: { user: true, server: true },
    });

    return NextResponse.json({
      ...updated,
      dataLimit: updated.dataLimit ? Number(updated.dataLimit) : null,
    });
  } catch (error) {
    console.error("PATCH /api/admin/keys failed:", error);
    return NextResponse.json({ error: "Failed to update key" }, { status: 500 });
  }
}

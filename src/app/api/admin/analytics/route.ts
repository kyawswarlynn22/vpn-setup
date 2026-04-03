import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDataUsage } from "@/lib/outline";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function checkAuth(req: NextRequest) {
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${process.env.ADMIN_PASSWORD}`;
}

// Map data limits (bytes) to plan prices (MMK)
const PLAN_PRICES: { limitGB: number; price: number }[] = [
  { limitGB: 10, price: 1500 },
  { limitGB: 25, price: 3000 },
  { limitGB: 50, price: 5000 },
  { limitGB: 120, price: 10000 },
  { limitGB: 250, price: 20000 },
  { limitGB: 0, price: 25000 }, // unlimited
];

function estimateRevenue(dataLimitBytes: bigint | null): number {
  if (!dataLimitBytes) return 25000; // unlimited plan
  const gb = Number(dataLimitBytes) / 1_073_741_824;
  // Find closest plan
  let closest = PLAN_PRICES[0];
  let minDiff = Infinity;
  for (const plan of PLAN_PRICES) {
    if (plan.limitGB === 0) continue;
    const diff = Math.abs(plan.limitGB - gb);
    if (diff < minDiff) {
      minDiff = diff;
      closest = plan;
    }
  }
  return closest.price;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();

  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // All keys for analytics
    const allKeys = await prisma.vpnKey.findMany({
      include: { server: true },
    });

    // --- Monthly breakdown (last 6 months) ---
    const months: { label: string; start: Date; end: Date }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      const label = start.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      months.push({ label, start, end });
    }

    const monthlyData = months.map((m) => {
      const created = allKeys.filter(
        (k) => new Date(k.createdAt) >= m.start && new Date(k.createdAt) <= m.end
      );
      const expired = allKeys.filter(
        (k) =>
          k.status !== "ACTIVE" &&
          new Date(k.expiresAt) >= m.start &&
          new Date(k.expiresAt) <= m.end
      );
      // Keys that were active at end of month
      const activeAtEnd = allKeys.filter(
        (k) =>
          new Date(k.createdAt) <= m.end &&
          (k.status === "ACTIVE" || new Date(k.expiresAt) > m.end)
      ).length;
      // Keys active at start of month
      const activeAtStart = allKeys.filter(
        (k) =>
          new Date(k.createdAt) <= m.start &&
          (k.status === "ACTIVE" || new Date(k.expiresAt) > m.start)
      ).length;

      const revenue = created.reduce((sum, k) => sum + estimateRevenue(k.dataLimit), 0);
      const churnRate = activeAtStart > 0 ? Math.round((expired.length / activeAtStart) * 100) : 0;

      return {
        label: m.label,
        newKeys: created.length,
        expiredKeys: expired.length,
        revenue,
        churnRate,
        activeKeys: activeAtEnd,
      };
    });

    // --- Top servers by usage ---
    const servers = await prisma.server.findMany({
      include: { _count: { select: { vpnKeys: true } } },
    });

    const serverUsage: { name: string; keyCount: number; bytesUsed: number }[] = [];
    await Promise.allSettled(
      servers.map(async (server) => {
        try {
          const usage = await getDataUsage(server.apiUrl);
          const bytes = usage.bytesTransferredByUserId ?? {};
          const totalBytes = Object.values(bytes).reduce((sum: number, b) => sum + (b as number), 0);
          serverUsage.push({
            name: server.name,
            keyCount: server._count.vpnKeys,
            bytesUsed: totalBytes,
          });
        } catch {
          serverUsage.push({
            name: server.name,
            keyCount: server._count.vpnKeys,
            bytesUsed: 0,
          });
        }
      })
    );
    serverUsage.sort((a, b) => b.bytesUsed - a.bytesUsed);

    // --- Plan distribution ---
    const planDist: Record<string, number> = {};
    for (const key of allKeys) {
      let planName: string;
      if (!key.dataLimit) {
        planName = "Unlimited";
      } else {
        const gb = Number(key.dataLimit) / 1_073_741_824;
        planName = `${Math.round(gb)} GB`;
      }
      planDist[planName] = (planDist[planName] || 0) + 1;
    }

    // --- Summary stats ---
    const totalRevenue = allKeys.reduce((sum, k) => sum + estimateRevenue(k.dataLimit), 0);
    const activeCount = allKeys.filter((k) => k.status === "ACTIVE").length;
    const expiredCount = allKeys.filter((k) => k.status !== "ACTIVE").length;
    const overallChurn = allKeys.length > 0 ? Math.round((expiredCount / allKeys.length) * 100) : 0;

    return NextResponse.json({
      summary: {
        totalKeys: allKeys.length,
        activeKeys: activeCount,
        totalRevenue,
        churnRate: overallChurn,
      },
      monthlyData,
      serverUsage,
      planDistribution: Object.entries(planDist).map(([name, count]) => ({ name, count })),
    });
  } catch (error) {
    console.error("GET /api/admin/analytics failed:", error);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}

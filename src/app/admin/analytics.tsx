"use client";

import { useCallback, useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  DollarSign,
  Users,
  Activity,
  Globe,
  Loader2,
  ArrowLeft,
  PieChart,
} from "lucide-react";

interface MonthlyData {
  label: string;
  newKeys: number;
  expiredKeys: number;
  revenue: number;
  churnRate: number;
  activeKeys: number;
}

interface ServerUsage {
  name: string;
  keyCount: number;
  bytesUsed: number;
}

interface PlanDist {
  name: string;
  count: number;
}

interface AnalyticsData {
  summary: {
    totalKeys: number;
    activeKeys: number;
    totalRevenue: number;
    churnRate: number;
  };
  monthlyData: MonthlyData[];
  serverUsage: ServerUsage[];
  planDistribution: PlanDist[];
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatMMK(amount: number): string {
  return amount.toLocaleString() + " MMK";
}

const PIE_COLORS = [
  "#6366f1", "#14b8a6", "#3b82f6", "#a855f7", "#f59e0b", "#ef4444",
];

export default function Analytics({
  token,
  onBack,
}: {
  token: string;
  onBack: () => void;
}) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/analytics", { headers });
      if (res.ok) setData(await res.json());
    } catch {
      /* handled by empty state */
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-muted">
        <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Failed to load analytics</p>
      </div>
    );
  }

  const { summary, monthlyData, serverUsage, planDistribution } = data;

  // Chart helpers
  const maxRevenue = Math.max(...monthlyData.map((m) => m.revenue), 1);
  const maxNewKeys = Math.max(...monthlyData.map((m) => m.newKeys), 1);
  const maxServerBytes = Math.max(...serverUsage.map((s) => s.bytesUsed), 1);
  const totalPlanKeys = planDistribution.reduce((s, p) => s + p.count, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 bg-card border border-card-border rounded-lg hover:bg-card-border transition-colors"
            title="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-muted text-sm mt-1">Revenue, growth & usage insights</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Est. Total Revenue",
            value: formatMMK(summary.totalRevenue),
            icon: DollarSign,
            color: "primary",
          },
          {
            label: "Total Keys",
            value: summary.totalKeys,
            icon: BarChart3,
            color: "primary",
          },
          {
            label: "Active Keys",
            value: summary.activeKeys,
            icon: Users,
            color: "success",
          },
          {
            label: "Churn Rate",
            value: `${summary.churnRate}%`,
            icon: summary.churnRate > 50 ? TrendingDown : TrendingUp,
            color: summary.churnRate > 50 ? "danger" : "success",
          },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-card-border rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-${s.color}/10 flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 text-${s.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-card border border-card-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <DollarSign className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Monthly Revenue (Est.)</h2>
          </div>
          <div className="flex items-end gap-3 h-48">
            {monthlyData.map((m) => {
              const pct = (m.revenue / maxRevenue) * 100;
              return (
                <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted font-medium">
                    {m.revenue > 0 ? formatMMK(m.revenue).replace(" MMK", "") : "0"}
                  </span>
                  <div className="w-full flex items-end" style={{ height: "140px" }}>
                    <div
                      className="w-full bg-primary/80 rounded-t-md transition-all hover:bg-primary"
                      style={{ height: `${Math.max(pct, 2)}%` }}
                      title={`${m.label}: ${formatMMK(m.revenue)}`}
                    />
                  </div>
                  <span className="text-[10px] text-muted">{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* New Keys / Month */}
        <div className="bg-card border border-card-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Activity className="w-5 h-5 text-success" />
            <h2 className="text-lg font-semibold">New Keys / Month</h2>
          </div>
          <div className="flex items-end gap-3 h-48">
            {monthlyData.map((m) => {
              const pct = (m.newKeys / maxNewKeys) * 100;
              return (
                <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted font-bold">{m.newKeys}</span>
                  <div className="w-full flex items-end" style={{ height: "140px" }}>
                    <div
                      className="w-full bg-success/80 rounded-t-md transition-all hover:bg-success"
                      style={{ height: `${Math.max(pct, 2)}%` }}
                      title={`${m.label}: ${m.newKeys} new keys`}
                    />
                  </div>
                  <span className="text-[10px] text-muted">{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Churn Rate */}
        <div className="bg-card border border-card-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingDown className="w-5 h-5 text-warning" />
            <h2 className="text-lg font-semibold">Monthly Churn Rate</h2>
          </div>
          <div className="space-y-3">
            {monthlyData.map((m) => (
              <div key={m.label} className="flex items-center gap-3">
                <span className="text-xs text-muted w-16 shrink-0">{m.label}</span>
                <div className="flex-1 bg-card-border rounded-full h-5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      m.churnRate > 50
                        ? "bg-danger"
                        : m.churnRate > 25
                          ? "bg-warning"
                          : "bg-success"
                    }`}
                    style={{ width: `${Math.max(m.churnRate, 1)}%` }}
                  />
                </div>
                <span
                  className={`text-xs font-semibold w-10 text-right ${
                    m.churnRate > 50
                      ? "text-danger"
                      : m.churnRate > 25
                        ? "text-warning"
                        : "text-success"
                  }`}
                >
                  {m.churnRate}%
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mt-4">
            Churn = expired keys ÷ active keys at start of month
          </p>
        </div>

        {/* Plan Distribution */}
        <div className="bg-card border border-card-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <PieChart className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Plan Distribution</h2>
          </div>
          {planDistribution.length === 0 ? (
            <div className="text-center py-8 text-muted text-sm">No data</div>
          ) : (
            <>
              {/* Simple donut via SVG */}
              <div className="flex items-center gap-6">
                <svg viewBox="0 0 36 36" className="w-32 h-32 shrink-0">
                  {(() => {
                    let offset = 0;
                    return planDistribution.map((p, i) => {
                      const pct = (p.count / totalPlanKeys) * 100;
                      const el = (
                        <circle
                          key={p.name}
                          cx="18"
                          cy="18"
                          r="15.915"
                          fill="none"
                          stroke={PIE_COLORS[i % PIE_COLORS.length]}
                          strokeWidth="3.5"
                          strokeDasharray={`${pct} ${100 - pct}`}
                          strokeDashoffset={`${-offset}`}
                          strokeLinecap="round"
                        />
                      );
                      offset += pct;
                      return el;
                    });
                  })()}
                  <text x="18" y="18.5" textAnchor="middle" className="fill-foreground text-[5px] font-bold">
                    {totalPlanKeys}
                  </text>
                  <text x="18" y="22" textAnchor="middle" className="fill-muted text-[2.5px]">
                    keys
                  </text>
                </svg>
                <div className="space-y-2 flex-1">
                  {planDistribution.map((p, i) => {
                    const pct = totalPlanKeys > 0 ? Math.round((p.count / totalPlanKeys) * 100) : 0;
                    return (
                      <div key={p.name} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-sm shrink-0"
                          style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                        />
                        <span className="text-sm flex-1">{p.name}</span>
                        <span className="text-xs text-muted">{p.count}</span>
                        <span className="text-xs font-medium w-8 text-right">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Top Servers by Usage */}
      <div className="bg-card border border-card-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Top Servers by Usage</h2>
        </div>
        {serverUsage.length === 0 ? (
          <div className="text-center py-8 text-muted text-sm">No servers</div>
        ) : (
          <div className="space-y-4">
            {serverUsage.map((srv, i) => {
              const pct = (srv.bytesUsed / maxServerBytes) * 100;
              return (
                <div key={srv.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted font-mono w-5">#{i + 1}</span>
                      <span className="text-sm font-medium">{srv.name}</span>
                      <span className="text-xs text-muted bg-card-border px-2 py-0.5 rounded-full">
                        {srv.keyCount} keys
                      </span>
                    </div>
                    <span className="text-sm font-semibold">{formatBytes(srv.bytesUsed)}</span>
                  </div>
                  <div className="bg-card-border rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.max(pct, 1)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

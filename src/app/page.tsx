"use client";

import { useState } from "react";
import {
  Search,
  Wifi,
  Activity,
  HardDrive,
  Clock,
  AlertCircle,
  Loader2,
  Globe,
  CalendarClock,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface KeyStatus {
  keyId: string;
  name: string | null;
  serverName: string;
  status: "ACTIVE" | "EXPIRED" | "REVOKED";
  dataLimit: number | null;
  bytesUsed: number;
  dataUsedGB: number;
  dataLimitGB: number | null;
  expiresAt: string;
  daysLeft: number;
  createdAt: string;
}

export default function StatusPage() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [keys, setKeys] = useState<KeyStatus[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setError(""); setKeys([]); setSearched(true);
    try {
      const res = await fetch(`/api/status?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong"); return; }
      setKeys(data.keys);
    } catch { setError("Failed to connect to server"); }
    finally { setLoading(false); }
  }

  function statusBadge(status: string) {
    const map: Record<string, string> = {
      ACTIVE: "bg-success/20 text-success",
      EXPIRED: "bg-warning/20 text-warning",
      REVOKED: "bg-danger/20 text-danger",
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[status] ?? "bg-muted/20 text-muted"}`}>
        {status}
      </span>
    );
  }

  function usageBar(used: number, limit: number | null) {
    if (!limit) return null;
    const pct = Math.min((used / limit) * 100, 100);
    const color = pct > 90 ? "bg-danger" : pct > 70 ? "bg-warning" : "bg-primary";
    return (
      <div className="w-full bg-card-border rounded-full h-2 mt-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <Wifi className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">{t("statusTitle")}</h1>
        <p className="text-muted">{t("statusSubtitle")}</p>
      </div>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full pl-12 pr-4 py-3.5 bg-card border border-card-border rounded-xl text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
          <button type="submit" disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("search")}
          </button>
        </div>
      </form>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-danger/10 border border-danger/20 rounded-xl mb-6">
          <AlertCircle className="w-5 h-5 text-danger shrink-0" />
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {keys.length > 0 && (
        <div className="space-y-4">
          {keys.map((key) => (
            <div key={key.keyId} className="bg-card border border-card-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{key.name || `Key ${key.keyId}`}</h3>
                  <p className="text-sm text-muted font-mono">ID: {key.keyId}</p>
                </div>
                {statusBadge(key.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <HardDrive className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">{t("dataUsed")}</p>
                    <p className="font-semibold">{key.dataUsedGB} GB</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">{t("dataLimit")}</p>
                    <p className="font-semibold">{key.dataLimitGB ? `${key.dataLimitGB} GB` : t("unlimited")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">{t("server")}</p>
                    <p className="font-semibold">{key.serverName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    key.daysLeft === 0 ? "bg-danger/10" : key.daysLeft <= 7 ? "bg-warning/10" : "bg-primary/10"
                  }`}>
                    <CalendarClock className={`w-5 h-5 ${
                      key.daysLeft === 0 ? "text-danger" : key.daysLeft <= 7 ? "text-warning" : "text-primary"
                    }`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted">{t("expires")}</p>
                    <p className={`font-semibold ${
                      key.daysLeft === 0 ? "text-danger" : key.daysLeft <= 7 ? "text-warning" : ""
                    }`}>
                      {key.daysLeft === 0 ? t("expired") : `${key.daysLeft} ${t("daysLeft")}`}
                    </p>
                  </div>
                </div>
              </div>

              {usageBar(key.dataUsedGB, key.dataLimitGB)}

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-card-border">
                <Clock className="w-4 h-4 text-muted" />
                <span className="text-xs text-muted">
                  {t("created")} {new Date(key.createdAt).toLocaleDateString()} &middot; {t("expires")} {new Date(key.expiresAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {searched && !loading && keys.length === 0 && !error && (
        <div className="text-center py-10 text-muted">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{t("noResults")}</p>
        </div>
      )}
    </div>
  );
}

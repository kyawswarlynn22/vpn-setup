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
  CreditCard,
  HelpCircle,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="text-center mb-8 sm:mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 mb-3 sm:mb-4">
          <Wifi className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t("statusTitle")}</h1>
        <p className="text-sm sm:text-base text-muted">{t("statusSubtitle")}</p>
      </div>

      <form onSubmit={handleSearch} className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:relative">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full pl-12 pr-4 py-3.5 bg-card border border-card-border rounded-xl sm:rounded-r-none text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
          </div>
          <button type="submit" disabled={loading || !query.trim()}
            className="w-full sm:w-auto px-6 py-3.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-xl sm:rounded-l-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4" /> {t("search")}</>}
          </button>
        </div>
      </form>

      {/* Quick nav grid - visible on mobile */}
      <div className="grid grid-cols-3 gap-3 mb-6 sm:mb-8 md:hidden">
        <Link href="/pricing"
          className="flex flex-col items-center gap-2 p-4 bg-card border border-card-border rounded-xl hover:border-primary/40 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xs font-medium text-muted">{t("pricing")}</span>
        </Link>
        <Link href="/faq"
          className="flex flex-col items-center gap-2 p-4 bg-card border border-card-border rounded-xl hover:border-primary/40 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xs font-medium text-muted">{t("faq")}</span>
        </Link>
        <Link href="/contact"
          className="flex flex-col items-center gap-2 p-4 bg-card border border-card-border rounded-xl hover:border-primary/40 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xs font-medium text-muted">{t("contactUs")}</span>
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-danger/10 border border-danger/20 rounded-xl mb-6">
          <AlertCircle className="w-5 h-5 text-danger shrink-0" />
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {keys.length > 0 && (
        <div className="space-y-4">
          {keys.map((key) => (
            <div key={key.keyId} className="bg-card border border-card-border rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-base sm:text-lg">{key.name || `Key ${key.keyId}`}</h3>
                  <p className="text-xs sm:text-sm text-muted font-mono">ID: {key.keyId}</p>
                </div>
                {statusBadge(key.status)}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <HardDrive className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] sm:text-xs text-muted">{t("dataUsed")}</p>
                    <p className="font-semibold text-sm sm:text-base">{key.dataUsedGB} GB</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] sm:text-xs text-muted">{t("dataLimit")}</p>
                    <p className="font-semibold text-sm sm:text-base">{key.dataLimitGB ? `${key.dataLimitGB} GB` : t("unlimited")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] sm:text-xs text-muted">{t("server")}</p>
                    <p className="font-semibold text-sm sm:text-base truncate">{key.serverName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    key.daysLeft === 0 ? "bg-danger/10" : key.daysLeft <= 7 ? "bg-warning/10" : "bg-primary/10"
                  }`}>
                    <CalendarClock className={`w-4 h-4 sm:w-5 sm:h-5 ${
                      key.daysLeft === 0 ? "text-danger" : key.daysLeft <= 7 ? "text-warning" : "text-primary"
                    }`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] sm:text-xs text-muted">{t("expires")}</p>
                    <p className={`font-semibold text-sm sm:text-base ${
                      key.daysLeft === 0 ? "text-danger" : key.daysLeft <= 7 ? "text-warning" : ""
                    }`}>
                      {key.daysLeft === 0 ? t("expired") : `${key.daysLeft} ${t("daysLeft")}`}
                    </p>
                  </div>
                </div>
              </div>

              {usageBar(key.dataUsedGB, key.dataLimitGB)}

              <div className="flex items-start gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-card-border">
                <Clock className="w-4 h-4 text-muted shrink-0 mt-0.5" />
                <span className="text-[11px] sm:text-xs text-muted leading-relaxed">
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

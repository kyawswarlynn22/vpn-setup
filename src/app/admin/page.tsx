"use client";

import { useState } from "react";
import { Lock, LogIn, Loader2 } from "lucide-react";
import AdminDashboard from "./dashboard";
import Analytics from "./analytics";
import { useI18n } from "@/lib/i18n";

export default function AdminPage() {
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [view, setView] = useState<"dashboard" | "analytics">("dashboard");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/keys", {
        headers: { Authorization: `Bearer ${password}` },
      });

      if (res.status === 401) {
        setError("Invalid password");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Server error (${res.status})`);
        return;
      }

      setAuthenticated(true);
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  }

  if (authenticated) {
    if (view === "analytics") {
      return <Analytics token={password} onBack={() => setView("dashboard")} />;
    }
    return <AdminDashboard token={password} onAnalytics={() => setView("analytics")} />;
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-20">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{t("adminTitle")}</h1>
        <p className="text-muted text-sm">{t("adminSubtitle")}</p>
      </div>

      <form onSubmit={handleLogin}>
        <div className="bg-card border border-card-border rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t("password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("passwordPlaceholder")}
              className="w-full px-4 py-3 bg-background border border-card-border rounded-lg text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>

          {error && (
            <p className="text-sm text-danger">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                {t("signIn")}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

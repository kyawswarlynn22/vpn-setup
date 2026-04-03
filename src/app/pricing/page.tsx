"use client";

import { Zap, Crown, Rocket, Gem, Flame, Check, Monitor, ScrollText, Users, Percent, Infinity, Smartphone } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";

const plans = [
  {
    icon: Zap,
    data: "10GB",
    price: "1,500",
    resellerPrice: "1,200",
    profit: "300",
    devices: 0,
    color: "from-slate-500 to-slate-700",
    border: "border-slate-500/30",
    badge: null,
  },
  {
    icon: Flame,
    data: "25GB",
    price: "3,000",
    resellerPrice: "2,400",
    profit: "600",
    devices: 0,
    color: "from-teal-500 to-teal-700",
    border: "border-teal-500/30",
    badge: null,
  },
  {
    icon: Rocket,
    data: "50GB",
    price: "5,000",
    resellerPrice: "4,000",
    profit: "1,000",
    devices: 0,
    color: "from-blue-500 to-blue-700",
    border: "border-blue-500/30",
    badge: "popular",
  },
  {
    icon: Crown,
    data: "120GB",
    price: "10,000",
    resellerPrice: "8,000",
    profit: "2,000",
    devices: 0,
    color: "from-purple-500 to-purple-700",
    border: "border-purple-500/30",
    badge: null,
  },
  {
    icon: Gem,
    data: "250GB",
    price: "20,000",
    resellerPrice: "16,000",
    profit: "4,000",
    devices: 0,
    color: "from-amber-500 to-amber-700",
    border: "border-amber-500/30",
    badge: "best",
  },
  {
    icon: Infinity,
    data: "Unlimited",
    price: "25,000",
    resellerPrice: "20,000",
    profit: "5,000",
    devices: 5,
    color: "from-rose-500 to-rose-700",
    border: "border-rose-500/30",
    badge: "unlimited",
  },
];

export default function PricingPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<"retail" | "reseller">("retail");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <Crown className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">{t("pricingTitle")}</h1>
        <p className="text-muted max-w-md mx-auto">{t("pricingSubtitle")}</p>
      </div>

      {/* Tab Toggle */}
      <div className="flex items-center justify-center mb-10">
        <div className="inline-flex bg-card border border-card-border rounded-xl p-1">
          <button
            onClick={() => setTab("retail")}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${
              tab === "retail" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            <Users className="w-4 h-4" />
            {t("retailTab")}
          </button>
          <button
            onClick={() => setTab("reseller")}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${
              tab === "reseller" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            <Percent className="w-4 h-4" />
            {t("resellerTab")}
          </button>
        </div>
      </div>

      {/* Reseller Banner */}
      {tab === "reseller" && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-8 text-center">
          <p className="text-sm font-semibold text-primary mb-1">{t("resellerBanner")}</p>
          <p className="text-xs text-muted">{t("resellerBannerDesc")}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {plans.map((plan) => (
          <div
            key={plan.data}
            className={`relative bg-card border ${plan.border} rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
          >
            {plan.badge && (
              <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white rounded-bl-xl ${
                plan.badge === "popular" ? "bg-blue-500" : plan.badge === "unlimited" ? "bg-rose-500" : "bg-amber-500"
              }`}>
                {plan.badge === "popular" ? t("popular") : plan.badge === "unlimited" ? t("unlimitedBadge") : t("bestValue")}
              </div>
            )}

            <div className={`bg-linear-to-br ${plan.color} p-5 text-white`}>
              <plan.icon className="w-8 h-8 mb-3 opacity-90" />
              <p className="text-3xl font-extrabold">{plan.data}</p>
            </div>

            <div className="p-5">
              {tab === "retail" ? (
                <p className="text-2xl font-bold mb-1">
                  {plan.price}
                  <span className="text-sm font-normal text-muted ml-1">{t("currency")}</span>
                </p>
              ) : (
                <>
                  <p className="text-2xl font-bold mb-0.5">
                    {plan.resellerPrice}
                    <span className="text-sm font-normal text-muted ml-1">{t("currency")}</span>
                  </p>
                  <p className="text-xs text-muted line-through">{t("retailLabel")} {plan.price} {t("currency")}</p>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-success/10 text-success text-xs font-medium rounded-full">
                    <Percent className="w-3 h-3" />
                    {t("profitLabel")} {plan.profit} {t("currency")}
                  </div>
                </>
              )}

              <div className="space-y-2.5 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-success shrink-0" />
                  <span>{t("thirtyDays")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Smartphone className="w-4 h-4 text-success shrink-0" />
                  <span>{plan.devices === 0 ? t("unlimitedDevices") : `${plan.devices} ${t("devices")}`}</span>
                </div>
                {tab === "reseller" && (
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-success shrink-0" />
                    <span>{t("commission20")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-card-border rounded-2xl p-6 text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Monitor className="w-5 h-5 text-primary" />
          <p className="text-sm font-medium">{t("worksOn")}</p>
        </div>
        <p className="text-xs text-muted">Windows, Mac, iOS, Android, Linux</p>
      </div>

      {/* Terms & Conditions */}
      <div className="bg-card border border-card-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <ScrollText className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">{t("termsTitle")}</h2>
        </div>
        <ol className="list-decimal list-inside space-y-2.5 text-sm text-muted">
          <li>{t("term1")}</li>
          <li>{t("term2")}</li>
          <li>{t("term3")}</li>
          <li>{t("term4")}</li>
          <li>{t("term5")}</li>
          <li>{t("term6")}</li>
        </ol>
      </div>
    </div>
  );
}

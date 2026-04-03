"use client";

import { useState } from "react";
import {
  HelpCircle,
  ChevronDown,
  Smartphone,
  Monitor,
  Apple,
  Download,
  Key,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n";

function AndroidIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.523 2.246a.75.75 0 0 0-1.046.23l-1.2 1.92A7.453 7.453 0 0 0 12 3.75a7.453 7.453 0 0 0-3.277.646l-1.2-1.92a.75.75 0 1 0-1.276.796l1.13 1.808A7.49 7.49 0 0 0 4.5 11.25h15a7.49 7.49 0 0 0-2.877-6.17l1.13-1.808a.75.75 0 0 0-.23-1.046zM9.5 8.75a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5zm5 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5zM4.5 12.75v6a2.25 2.25 0 0 0 2.25 2.25h.75v2.25a.75.75 0 0 0 1.5 0V21h6v2.25a.75.75 0 0 0 1.5 0V21h.75a2.25 2.25 0 0 0 2.25-2.25v-6h-15zM2.25 12.75a.75.75 0 0 0-.75.75v5.25a.75.75 0 0 0 1.5 0V13.5a.75.75 0 0 0-.75-.75zm19.5 0a.75.75 0 0 0-.75.75v5.25a.75.75 0 0 0 1.5 0V13.5a.75.75 0 0 0-.75-.75z" />
    </svg>
  );
}

interface Step {
  titleKey: TranslationKey;
  descKey: TranslationKey;
}

interface ConnectGuide {
  titleKey: TranslationKey;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  storeUrl: string;
  storeLabelKey: TranslationKey;
  steps: Step[];
}

const connectGuides: ConnectGuide[] = [
  {
    titleKey: "guideAndroid",
    icon: AndroidIcon,
    color: "bg-green-500",
    storeUrl: "https://play.google.com/store/apps/details?id=org.outline.android.client",
    storeLabelKey: "downloadPlayStore",
    steps: [
      { titleKey: "stepAndroid1Title", descKey: "stepAndroid1Desc" },
      { titleKey: "stepAndroid2Title", descKey: "stepAndroid2Desc" },
      { titleKey: "stepAndroid3Title", descKey: "stepAndroid3Desc" },
    ],
  },
  {
    titleKey: "guideIOS",
    icon: Apple,
    color: "bg-gray-800",
    storeUrl: "https://apps.apple.com/app/outline-app/id1356177741",
    storeLabelKey: "downloadAppStore",
    steps: [
      { titleKey: "stepIOS1Title", descKey: "stepIOS1Desc" },
      { titleKey: "stepIOS2Title", descKey: "stepIOS2Desc" },
      { titleKey: "stepIOS3Title", descKey: "stepIOS3Desc" },
    ],
  },
  {
    titleKey: "guideWindows",
    icon: Monitor,
    color: "bg-blue-500",
    storeUrl: "https://s3.amazonaws.com/outline-releases/client/windows/stable/Outline-Client.exe",
    storeLabelKey: "downloadWindows",
    steps: [
      { titleKey: "stepWin1Title", descKey: "stepWin1Desc" },
      { titleKey: "stepWin2Title", descKey: "stepWin2Desc" },
      { titleKey: "stepWin3Title", descKey: "stepWin3Desc" },
    ],
  },
  {
    titleKey: "guideMac",
    icon: Apple,
    color: "bg-gray-600",
    storeUrl: "https://apps.apple.com/app/outline-app/id1356178125",
    storeLabelKey: "downloadMac",
    steps: [
      { titleKey: "stepMac1Title", descKey: "stepMac1Desc" },
      { titleKey: "stepMac2Title", descKey: "stepMac2Desc" },
      { titleKey: "stepMac3Title", descKey: "stepMac3Desc" },
    ],
  },
];

interface FaqItem {
  qKey: TranslationKey;
  aKey: TranslationKey;
  icon: React.ComponentType<{ className?: string }>;
}

const faqItems: FaqItem[] = [
  { qKey: "faq1Q", aKey: "faq1A", icon: HelpCircle },
  { qKey: "faq2Q", aKey: "faq2A", icon: Key },
  { qKey: "faq3Q", aKey: "faq3A", icon: Smartphone },
  { qKey: "faq4Q", aKey: "faq4A", icon: ShieldCheck },
  { qKey: "faq5Q", aKey: "faq5A", icon: RefreshCw },
  { qKey: "faq6Q", aKey: "faq6A", icon: AlertTriangle },
];

export default function FaqPage() {
  const { t } = useI18n();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openGuide, setOpenGuide] = useState<number | null>(0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <HelpCircle className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">{t("faqTitle")}</h1>
        <p className="text-muted">{t("faqSubtitle")}</p>
      </div>

      {/* How to Connect */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Download className="w-5 h-5 text-primary" />
          {t("howToConnect")}
        </h2>

        <div className="space-y-4">
          {connectGuides.map((guide, i) => (
            <div key={i} className="bg-card border border-card-border rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenGuide(openGuide === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-card-border/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${guide.color} text-white flex items-center justify-center shrink-0`}>
                    <guide.icon className="w-5 h-5" />
                  </div>
                  <span className="font-semibold">{t(guide.titleKey)}</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-muted transition-transform duration-200 ${openGuide === i ? "rotate-180" : ""}`} />
              </button>

              {openGuide === i && (
                <div className="px-5 pb-5 border-t border-card-border pt-4">
                  {/* Download button */}
                  <a
                    href={guide.storeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors mb-5"
                  >
                    <Download className="w-4 h-4" />
                    {t(guide.storeLabelKey)}
                  </a>

                  {/* Steps */}
                  <div className="space-y-4">
                    {guide.steps.map((step, j) => (
                      <div key={j} className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-sm font-bold">
                          {j + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{t(step.titleKey)}</p>
                          <p className="text-xs text-muted mt-0.5">{t(step.descKey)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          {t("faqSection")}
        </h2>

        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <div key={i} className="bg-card border border-card-border rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-card-border/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-primary shrink-0" />
                  <span className="font-medium text-sm">{t(item.qKey)}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 border-t border-card-border pt-4">
                  <p className="text-sm text-muted leading-relaxed">{t(item.aKey)}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

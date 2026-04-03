"use client";

import Link from "next/link";
import { Shield, Languages } from "lucide-react";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { ReactNode } from "react";

function Nav() {
  const { lang, setLang, t } = useI18n();

  return (
    <nav className="border-b border-card-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <Shield className="w-6 h-6 text-primary" />
          <span>{t("brand")}</span>
        </Link>
        <div className="flex items-center gap-5">
          <Link href="/" className="text-sm text-muted hover:text-foreground transition-colors">
            {t("checkStatus")}
          </Link>
          <Link href="/pricing" className="text-sm text-muted hover:text-foreground transition-colors">
            {t("pricing")}
          </Link>
          <Link href="/faq" className="text-sm text-muted hover:text-foreground transition-colors">
            {t("faq")}
          </Link>
          <Link href="/contact" className="text-sm text-muted hover:text-foreground transition-colors">
            {t("contactUs")}
          </Link>
          <button
            onClick={() => setLang(lang === "en" ? "mm" : "en")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-card border border-card-border rounded-lg hover:bg-card-border transition-colors"
            title="Switch language"
          >
            <Languages className="w-3.5 h-3.5" />
            {lang === "en" ? "မြန်မာ" : "English"}
          </button>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-card-border py-6 text-center text-sm text-muted">
      &copy; {new Date().getFullYear()} {t("brand")}. {t("footer")}
    </footer>
  );
}

export default function ClientShell({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </I18nProvider>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Menu, X, Wifi, CreditCard, HelpCircle, MessageCircle } from "lucide-react";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { ReactNode, useState, useEffect } from "react";

function Nav() {
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navLinks = [
    { href: "/", label: t("checkStatus"), icon: Wifi },
    { href: "/pricing", label: t("pricing"), icon: CreditCard },
    { href: "/faq", label: t("faq"), icon: HelpCircle },
    { href: "/contact", label: t("contactUs"), icon: MessageCircle },
  ];

  return (
    <nav className="border-b border-card-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <Shield className="w-6 h-6 text-primary" />
          <span>{t("brand")}</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-5">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className={`text-sm transition-colors ${pathname === link.href ? "text-primary font-medium" : "text-muted hover:text-foreground"}`}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile: hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg hover:bg-card-border transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-14 z-40 bg-background/95 backdrop-blur-sm">
          <div className="flex flex-col p-4 gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-colors ${
                    active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-card"
                  }`}>
                  <Icon className={`w-5 h-5 ${active ? "text-primary" : "text-muted"}`} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
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

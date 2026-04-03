"use client";

import { MessageSquare, Mail } from "lucide-react";
import { useI18n } from "@/lib/i18n";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.84a4.83 4.83 0 0 1-1-.15z" />
    </svg>
  );
}

function ViberIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M11.4 0C9.473.028 5.34.396 3.573 2.072 2.177 3.461 1.624 5.454 1.56 7.96c-.065 2.505-.15 7.205 4.407 8.478h.004l-.003 1.94s-.032.784.487 .944c.372.114.622-.112 1.992-1.63.75-.831 1.785-2.054 2.567-2.989 3.532.298 6.248-.382 6.555-.482.71-.232 4.726-.745 5.381-6.082.676-5.497-.322-8.976-2.086-10.556C19.167.7 15.49.04 11.4 0zm.32 1.71c3.607.038 6.836.538 8.22 1.79 1.404 1.258 2.248 4.237 1.661 8.93-.527 4.279-3.67 4.657-4.27 4.853-.255.083-2.612.655-5.558.435 0 0-2.2 2.655-2.888 3.35-.107.108-.234.15-.318.13-.12-.028-.153-.157-.152-.347l.02-3.636c-3.874-1.06-3.645-5.022-3.588-7.187.052-2.165.493-3.86 1.64-4.997C7.73 3.807 10.67 1.718 11.72 1.71zm-.458 3.076a.354.354 0 0 0 0 .708c1.206.016 2.28.466 3.136 1.278.858.814 1.362 1.908 1.396 3.13a.354.354 0 0 0 .708-.019c-.04-1.418-.624-2.688-1.618-3.63-1--.946-2.247-1.475-3.622-1.493v.026zm-1.82 1.396c-.2-.005-.406.07-.571.238l-.735.691c-.385.363-.466.897-.222 1.397.6 1.228 1.418 2.352 2.44 3.402 1.022 1.05 2.163 1.916 3.418 2.588.513.275 1.06.185 1.44-.188l.644-.758c.33-.387.29-.937-.088-1.288l-1.408-1.163a.698.698 0 0 0-.94.047l-.476.476a.333.333 0 0 1-.373.076 8.4 8.4 0 0 1-2.137-1.652 8.4 8.4 0 0 1-1.544-2.074.333.333 0 0 1 .087-.381l.49-.462a.698.698 0 0 0 .074-.938L8.033 6.44a.698.698 0 0 0-.591-.258zm3.995.582a.354.354 0 0 0-.006.708 2.45 2.45 0 0 1 1.704.74 2.45 2.45 0 0 1 .68 1.725.354.354 0 0 0 .708-.012 3.155 3.155 0 0 0-.878-2.222 3.155 3.155 0 0 0-2.196-.953l-.012.014z" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function GmailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
    </svg>
  );
}

export default function ContactPage() {
  const { t } = useI18n();

  const socials = [
    {
      icon: TikTokIcon,
      label: "TikTok",
      value: "@coder21vpn",
      href: "https://www.tiktok.com/@coder21vpn",
      color: "bg-[#010101]",
      textColor: "text-white",
    },
    {
      icon: ViberIcon,
      label: "Viber",
      value: "+95 9 123 456 789",
      href: "viber://chat?number=%2B95912345678",
      color: "bg-[#7360F2]",
      textColor: "text-white",
    },
    {
      icon: TelegramIcon,
      label: "Telegram",
      value: "@coder21vpn",
      href: "https://t.me/coder21vpn",
      color: "bg-[#26A5E4]",
      textColor: "text-white",
    },
    {
      icon: GmailIcon,
      label: "Gmail",
      value: "support@coder21vpn.com",
      href: "mailto:support@coder21vpn.com",
      color: "bg-[#EA4335]",
      textColor: "text-white",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <MessageSquare className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">{t("contactTitle")}</h1>
        <p className="text-muted">{t("contactSubtitle")}</p>
      </div>

      {/* Social Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {socials.map((item) => (
          <a
            key={item.label}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-card border border-card-border rounded-xl p-5 hover:border-primary/40 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${item.color} ${item.textColor} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-xs text-muted truncate">{item.value}</p>
              </div>
            </div>
          </a>
        ))}
      </div>

    </div>
  );
}

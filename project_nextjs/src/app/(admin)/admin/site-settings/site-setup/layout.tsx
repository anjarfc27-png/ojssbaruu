"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Info, Settings, Globe, Compass, Mail } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

type Props = { children: ReactNode };

export default function SiteSetupLayout({ children }: Props) {
  const pathname = usePathname();
  const { t } = useI18n();
  
  const LINKS = [
    { href: "/admin/site-settings/site-setup/settings", label: t('siteSettings.setup'), labelKey: 'siteSettings.setup' },
    { href: "/admin/site-settings/site-setup/information", label: t('siteSettings.information'), labelKey: 'siteSettings.information' },
    { href: "/admin/site-settings/site-setup/languages", label: t('siteSettings.languages'), labelKey: 'siteSettings.languages' },
    { href: "/admin/site-settings/site-setup/navigation", label: t('siteSettings.navigation'), labelKey: 'siteSettings.navigation' },
    { href: "/admin/site-settings/site-setup/bulk-emails", label: t('siteSettings.bulkEmails'), labelKey: 'siteSettings.bulkEmails' },
  ];
  
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-white shadow-sm">
      <div className="grid gap-0 md:grid-cols-[220px_1fr]">
        <aside className="border-r border-[var(--border)] bg-[var(--surface-muted)] p-4">
          <nav className="space-y-1">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-white text-[var(--foreground)] shadow-sm"
                      : "text-[var(--primary)] hover:bg-white"
                  }`}
                >
                  {link.href.endsWith("/settings") && <Settings className="h-4 w-4" />}
                  {link.href.endsWith("/information") && <Info className="h-4 w-4" />}
                  {link.href.endsWith("/languages") && <Globe className="h-4 w-4" />}
                  {link.href.endsWith("/navigation") && <Compass className="h-4 w-4" />}
                  {link.href.endsWith("/bulk-emails") && <Mail className="h-4 w-4" />}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
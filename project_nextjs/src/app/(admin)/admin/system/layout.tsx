"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useI18n } from "@/contexts/I18nContext";

type Props = {
  children: ReactNode;
};

export default function SystemLayout({ children }: Props) {
  const pathname = usePathname();
  const { t } = useI18n();

  const SYSTEM_LINKS = [
    { href: "/admin/system/system-information", label: t('admin.systemInformation'), labelKey: 'admin.systemInformation' },
    { href: "/admin/system/expire-sessions", label: t('admin.expireUserSessions'), labelKey: 'admin.expireUserSessions' },
    { href: "/admin/system/clear-data-caches", label: t('admin.clearDataCaches'), labelKey: 'admin.clearDataCaches' },
    { href: "/admin/system/clear-template-cache", label: t('admin.clearTemplateCache'), labelKey: 'admin.clearTemplateCache' },
    {
      href: "/admin/system/clear-scheduled-tasks",
      label: t('admin.clearScheduledTaskExecutionLogs'),
      labelKey: 'admin.clearScheduledTaskExecutionLogs',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Bar - Light Gray */}
      <div className="bg-gray-200 px-6 py-4" style={{
        backgroundColor: '#e5e5e5',
        padding: '1rem 1.5rem'
      }}>
        <h1 className="text-xl font-semibold text-gray-900" style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#111827'
        }}>
          {t('admin.administrativeFunctions')}
        </h1>
      </div>

      {/* Content */}
      <div className="px-6 py-6" style={{
        padding: '2rem 1.5rem'
      }}>
        <div className="grid gap-6 md:grid-cols-[250px_1fr]" style={{
          gap: '1.5rem'
        }}>
          <aside className="space-y-2 rounded border border-gray-200 bg-white p-4" style={{
            padding: '1rem'
          }}>
            {SYSTEM_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 text-sm ${
                    active ? "text-[#006798] font-semibold bg-blue-50" : "text-[#006798] hover:underline hover:bg-gray-50"
                  }`}
                  style={{
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.875rem',
                    borderRadius: '0.25rem'
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </aside>
          <div className="rounded border border-gray-200 bg-white p-6" style={{
            padding: '1.5rem'
          }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
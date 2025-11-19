export type NavItem = {
  label: string;
  href: string;
  description?: string;
};

export type NavSection = {
  id: string;
  label: string;
  items: NavItem[];
};

export const ADMIN_NAV_SECTIONS: NavSection[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    items: [
      {
        label: "Submissions",
        href: "/admin/dashboard",
        description: "Kelola submission artikel.",
      },
    ],
  },
  {
    id: "site-management",
    label: "Site Management",
    items: [
      {
        label: "Hosted Journals",
        href: "/admin/site-management/hosted-journals",
        description: "Kelola daftar jurnal yang di-host pada instalasi OJS.",
      },
      {
        label: "Site Settings",
        href: "/admin/site-settings/site-setup",
        description: "Atur preferensi dan konfigurasi situs secara global.",
      },
      {
        label: "Next Steps",
        href: "https://docs.pkp.sfu.ca/learning-ojs/3.3/en/site-administration#next-steps",
        description: "Panduan langkah berikutnya untuk konfigurasi Site Admin.",
      },
    ],
  },
  {
    id: "administrative-functions",
    label: "Administrative Functions",
    items: [
      {
        label: "System Information",
        href: "/admin/system/system-information",
      },
      {
        label: "Expire User Sessions",
        href: "/admin/system/expire-sessions",
      },
      {
        label: "Clear Data Caches",
        href: "/admin/system/clear-data-caches",
      },
      {
        label: "Clear Template Cache",
        href: "/admin/system/clear-template-cache",
      },
      {
        label: "Clear Scheduled Task Execution Logs",
        href: "/admin/system/clear-scheduled-tasks",
      },
    ],
  },
];

export const SITE_SETTING_TABS = [
  "site-setup",
  "appearance",
  "languages",
  "plugins",
  "navigation-menus",
  "bulk-emails",
] as const;

export type SiteSettingTab = (typeof SITE_SETTING_TABS)[number];

export const SITE_SETTING_TAB_LABELS: Record<SiteSettingTab, string> = {
  "site-setup": "Site Setup",
  appearance: "Appearance",
  languages: "Languages",
  plugins: "Plugins",
  "navigation-menus": "Navigation Menus",
  "bulk-emails": "Bulk Emails",
};


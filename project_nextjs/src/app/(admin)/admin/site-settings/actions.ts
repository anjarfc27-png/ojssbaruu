"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const settingsSchema = z.object({
  site_name: z.string().trim().min(1),
  intro: z.string().trim().optional().default(""),
  logo_url: z.string().trim().optional().default(""),
  min_password_length: z.coerce.number().int().min(6).max(64).default(8),
});

export type SiteSettings = z.infer<typeof settingsSchema>;

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("site_name,intro,logo_url,min_password_length")
      .eq("id", "site")
      .single();

    if (error) {
      if ((error as { code?: string }).code === "42P01") {
        return { site_name: "Open Journal Systems", intro: "", logo_url: "", min_password_length: 8 };
      }
      return { site_name: "Open Journal Systems", intro: "", logo_url: "", min_password_length: 8 };
    }

    const parsed = settingsSchema.safeParse(data ?? {});
    if (!parsed.success) {
      return { site_name: "Open Journal Systems", intro: "", logo_url: "", min_password_length: 8 };
    }
    return parsed.data;
  } catch {
    return { site_name: "Open Journal Systems", intro: "", logo_url: "", min_password_length: 8 };
  }
}

type UpdateResult = { ok: true } | { ok: false; message: string };

export async function updateSiteSettingsAction(formData: FormData): Promise<void> {
  try {
    const values = settingsSchema.safeParse({
      site_name: (formData.get("site_name") as string | null) ?? "",
      intro: (formData.get("intro") as string | null) ?? "",
      logo_url: (formData.get("logo_url") as string | null) ?? "",
      min_password_length: (formData.get("min_password_length") as string | null) ?? "8",
    });
    if (!values.success) {
      return;
    }

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from("site_settings")
      .upsert({ id: "site", ...values.data }, { onConflict: "id" });

    if (error) {
      return;
    }

    revalidatePath("/admin/site-settings/site-setup");
  } catch {
    return;
  }
}

const appearanceSchema = z.object({
  theme: z.string().trim().default("default"),
  header_bg: z.string().trim().default("#0a2d44"),
  show_logo: z.coerce.boolean().default(true),
  footer_html: z.string().trim().default(""),
});

export type SiteAppearance = z.infer<typeof appearanceSchema>;

export async function getSiteAppearance(): Promise<SiteAppearance> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("site_appearance")
      .select("theme,header_bg,show_logo,footer_html")
      .eq("id", "site")
      .single();
    if (error) {
      if ((error as { code?: string }).code === "42P01") {
        return { theme: "default", header_bg: "#0a2d44", show_logo: true, footer_html: "" };
      }
      return { theme: "default", header_bg: "#0a2d44", show_logo: true, footer_html: "" };
    }
    const parsed = appearanceSchema.safeParse(data ?? {});
    if (!parsed.success) {
      return { theme: "default", header_bg: "#0a2d44", show_logo: true, footer_html: "" };
    }
    return parsed.data;
  } catch {
    return { theme: "default", header_bg: "#0a2d44", show_logo: true, footer_html: "" };
  }
}

export async function updateSiteAppearanceAction(formData: FormData): Promise<void> {
  try {
    const values = appearanceSchema.safeParse({
      theme: (formData.get("theme") as string | null) ?? "default",
      header_bg: (formData.get("header_bg") as string | null) ?? "#0a2d44",
      show_logo: (formData.get("show_logo") as string | null) === "on",
      footer_html: (formData.get("footer_html") as string | null) ?? "",
    });
    if (!values.success) {
      return;
    }
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from("site_appearance")
      .upsert({ id: "site", ...values.data }, { onConflict: "id" });
    if (error) {
      return;
    }
    revalidatePath("/admin/site-settings/appearance");
  } catch {
    return;
  }
}

type PluginItem = { id: string; name: string; description: string; category: string; enabled: boolean };

const PLUGIN_CATALOG: PluginItem[] = [
  { id: "custom-block", name: "Custom Block Manager", description: "Kelola blok konten di sidebar.", category: "generic", enabled: true },
  { id: "google-analytics", name: "Google Analytics", description: "Tambahkan tracking Analytics.", category: "generic", enabled: false },
  { id: "crossref", name: "Crossref XML Export", description: "Ekspor metadata artikel ke Crossref XML.", category: "importexport", enabled: true },
  { id: "doaj", name: "DOAJ Export Plugin", description: "Ekspor metadata ke DOAJ.", category: "importexport", enabled: false },
];

export async function getSitePlugins(): Promise<PluginItem[]> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.from("site_plugins").select("id,name,description,category,enabled");
    const catalogMap = new Map(PLUGIN_CATALOG.map((plugin) => [plugin.id, plugin]));
    if (!error && data) {
      for (const row of data) {
        catalogMap.set(row.id, {
          id: row.id,
          name: row.name ?? catalogMap.get(row.id)?.name ?? row.id,
          description: row.description ?? catalogMap.get(row.id)?.description ?? "",
          category: row.category ?? catalogMap.get(row.id)?.category ?? "generic",
          enabled: Boolean(row.enabled ?? catalogMap.get(row.id)?.enabled ?? false),
        });
      }
    }
    return Array.from(catalogMap.values());
  } catch {
    return PLUGIN_CATALOG;
  }
}

export async function toggleSitePluginAction(formData: FormData): Promise<void> {
  try {
    const id = (formData.get("plugin_id") as string | null) ?? "";
    const enabled = (formData.get("enabled") as string | null) === "on";
    if (!id) {
      return;
    }
    const meta = PLUGIN_CATALOG.find((plugin) => plugin.id === id);
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from("site_plugins")
      .upsert(
        {
          id,
          enabled,
          name: meta?.name ?? id,
          description: meta?.description ?? "",
          category: meta?.category ?? "generic",
        },
        { onConflict: "id" },
      );
    if (error) {
      return;
    }
    revalidatePath("/admin/site-settings/plugins");
  } catch {
    return;
  }
}

const informationSchema = z.object({
  support_name: z.string().trim().min(1),
  support_email: z.string().email(),
  support_phone: z.string().trim().optional().default(""),
});

export type SiteInformation = z.infer<typeof informationSchema>;

export async function getSiteInformation(): Promise<SiteInformation> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("site_information")
      .select("support_name,support_email,support_phone")
      .eq("id", "site")
      .single();
    if (error) {
      return { support_name: "Site Administrator", support_email: "admin@example.com", support_phone: "+62 811 1234 5678" };
    }
    const parsed = informationSchema.safeParse(data ?? {});
    if (!parsed.success) {
      return { support_name: "Site Administrator", support_email: "admin@example.com", support_phone: "+62 811 1234 5678" };
    }
    return parsed.data;
  } catch {
    return { support_name: "Site Administrator", support_email: "admin@example.com", support_phone: "+62 811 1234 5678" };
  }
}

export async function updateSiteInformationAction(formData: FormData): Promise<void> {
  try {
    const values = informationSchema.safeParse({
      support_name: (formData.get("support_name") as string | null) ?? "",
      support_email: (formData.get("support_email") as string | null) ?? "",
      support_phone: (formData.get("support_phone") as string | null) ?? "",
    });
    if (!values.success) {
      return;
    }
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from("site_information")
      .upsert({ id: "site", ...values.data }, { onConflict: "id" });
    if (error) {
      return;
    }
    revalidatePath("/admin/site-settings/site-setup/information");
  } catch {
    return;
  }
}

const languagesSchema = z.object({
  default_locale: z.string().trim().min(1),
  enabled_locales: z.array(z.string().trim()).min(1),
});

export type SiteLanguages = z.infer<typeof languagesSchema>;

export async function getSiteLanguages(): Promise<SiteLanguages> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("site_languages")
      .select("default_locale,enabled_locales")
      .eq("id", "site")
      .single();
    if (error) {
      return { default_locale: "en", enabled_locales: ["id", "en", "es"] };
    }
    const enabled = Array.isArray((data as { enabled_locales?: unknown }).enabled_locales)
      ? ((data as { enabled_locales: string[] }).enabled_locales)
      : [];
    const parsed = languagesSchema.safeParse({
      default_locale: (data as { default_locale?: string }).default_locale ?? "en",
      enabled_locales: enabled.length ? enabled : ["id", "en", "es"],
    });
    if (!parsed.success) {
      return { default_locale: "en", enabled_locales: ["id", "en", "es"] };
    }
    return parsed.data;
  } catch {
    return { default_locale: "en", enabled_locales: ["id", "en", "es"] };
  }
}

export async function updateSiteLanguagesAction(formData: FormData): Promise<void> {
  try {
    const entries = formData.getAll("enabled_locales").map((x) => String(x));
    const values = languagesSchema.safeParse({
      default_locale: (formData.get("default_locale") as string | null) ?? "en",
      enabled_locales: entries.length ? entries : ["en"],
    });
    if (!values.success) {
      return;
    }
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from("site_languages")
      .upsert({ id: "site", default_locale: values.data.default_locale, enabled_locales: values.data.enabled_locales }, { onConflict: "id" });
    if (error) {
      return;
    }
    revalidatePath("/admin/site-settings/site-setup/languages");
  } catch {
    return;
  }
}

export async function installLocaleAction(localeCode: string): Promise<UpdateResult> {
  try {
    const current = await getSiteLanguages();
    if (current.enabled_locales.includes(localeCode)) {
      return { ok: false, message: "Bahasa ini sudah terinstall." };
    }
    const updatedLocales = [...current.enabled_locales, localeCode];
    const values = languagesSchema.safeParse({
      default_locale: current.default_locale,
      enabled_locales: updatedLocales,
    });
    if (!values.success) {
      return { ok: false, message: "Kode bahasa tidak valid." };
    }
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from("site_languages")
      .upsert({ id: "site", default_locale: values.data.default_locale, enabled_locales: values.data.enabled_locales }, { onConflict: "id" });
    if (error) {
      return { ok: false, message: "Tidak dapat menginstall bahasa." };
    }
    revalidatePath("/admin/site-settings/site-setup/languages");
    return { ok: true };
  } catch {
    return { ok: false, message: "Kesalahan saat menginstall bahasa." };
  }
}

const navigationSchema = z.object({
  primary: z.array(z.string().trim()),
  user: z.array(z.string().trim()),
});

export type SiteNavigation = z.infer<typeof navigationSchema>;

export async function getSiteNavigation(): Promise<SiteNavigation> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("site_navigation")
      .select("primary_items,user_items")
      .eq("id", "site")
      .single();
    if (error) {
      return { primary: ["Home", "About", "Login", "Register"], user: ["Dashboard", "Profile", "Logout"] };
    }
    const parsed = navigationSchema.safeParse({
      primary: (data as { primary_items?: string[] }).primary_items ?? ["Home", "About", "Login", "Register"],
      user: (data as { user_items?: string[] }).user_items ?? ["Dashboard", "Profile", "Logout"],
    });
    if (!parsed.success) {
      return { primary: ["Home", "About", "Login", "Register"], user: ["Dashboard", "Profile", "Logout"] };
    }
    return parsed.data;
  } catch {
    return { primary: ["Home", "About", "Login", "Register"], user: ["Dashboard", "Profile", "Logout"] };
  }
}

export async function updateSiteNavigationAction(formData: FormData): Promise<void> {
  try {
    const primary = String((formData.get("primary") as string | null) ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    const user = String((formData.get("user") as string | null) ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    const values = navigationSchema.safeParse({ primary, user });
    if (!values.success) {
      return;
    }
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from("site_navigation")
      .upsert({ id: "site", primary_items: values.data.primary, user_items: values.data.user }, { onConflict: "id" });
    if (error) {
      return;
    }
    revalidatePath("/admin/site-settings/site-setup/navigation");
  } catch {
    return;
  }
}

const bulkEmailsSchema = z.object({
  permissions: z.array(z.object({ id: z.string().trim(), allow: z.boolean() })),
});

export type BulkEmailPermissions = z.infer<typeof bulkEmailsSchema>;

export async function getBulkEmailPermissions(): Promise<BulkEmailPermissions> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("site_bulk_emails")
      .select("permissions")
      .eq("id", "site")
      .single();
    if (error) {
      return { permissions: [] };
    }
    const perms = Array.isArray((data as { permissions?: unknown }).permissions)
      ? ((data as { permissions: { id: string; allow: boolean }[] }).permissions)
      : [];
    const parsed = bulkEmailsSchema.safeParse({ permissions: perms });
    if (!parsed.success) {
      return { permissions: [] };
    }
    return parsed.data;
  } catch {
    return { permissions: [] };
  }
}

export async function updateBulkEmailPermissionsAction(formData: FormData): Promise<void> {
  try {
    const ids = formData.getAll("journal_id").map((x) => String(x));
    const allows = new Set(formData.getAll("allow_journal").map((x) => String(x)));
    const permissions = ids.map((id) => ({ id, allow: allows.has(id) }));
    const values = bulkEmailsSchema.safeParse({ permissions });
    if (!values.success) {
      return;
    }
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from("site_bulk_emails")
      .upsert({ id: "site", permissions: values.data.permissions }, { onConflict: "id" });
    if (error) {
      return;
    }
    revalidatePath("/admin/site-settings/site-setup/bulk-emails");
  } catch {
    return;
  }
}
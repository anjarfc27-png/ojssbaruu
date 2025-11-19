"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { DEFAULT_JOURNAL_SETTINGS, type JournalSettings } from "@/features/journals/types";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const journalSchema = z.object({
  title: z.string().trim().min(3, "Judul minimal 3 karakter."),
  path: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Path wajib diisi.")
    .regex(/^[a-z0-9\\-]+$/, "Path hanya boleh huruf, angka, dan tanda minus."),
  description: z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .nullable(),
  isPublic: z.boolean(),
});

const contextSchema = z.object({
  name: z.string().trim().min(3, "Nama jurnal minimal 3 karakter."),
  initials: z.string().trim().max(16).optional().default(""),
  abbreviation: z.string().trim().max(32).optional().default(""),
  publisher: z.string().trim().max(128).optional().default(""),
  issnOnline: z.string().trim().max(32).optional().default(""),
  issnPrint: z.string().trim().max(32).optional().default(""),
  focusScope: z.string().trim().optional().default(""),
});

const searchSchema = z.object({
  keywords: z.string().trim().optional().default(""),
  description: z.string().trim().optional().default(""),
  includeSupplemental: z.coerce.boolean().optional().default(true),
});

const themeSchema = z.object({
  theme: z.string().trim().min(1).default("default"),
  headerBg: z.string().trim().default("#0a2d44"),
  useSiteTheme: z.coerce.boolean().optional().default(true),
  showLogo: z.coerce.boolean().optional().default(true),
});

const restrictSchema = z.object({
  disabledRoles: z.array(z.string().trim()).default([]),
});

type Result = { success: true } | { success: false; message: string };

const revalidateHostedJournals = () => revalidatePath("/admin/site-management/hosted-journals");

const SECTION_SCHEMAS = {
  context: contextSchema,
  search: searchSchema,
  theme: themeSchema,
  restrictBulkEmails: restrictSchema,
} satisfies Record<keyof JournalSettings, z.ZodTypeAny>;

type PartialSettingsInput = {
  context?: Partial<JournalSettings["context"]>;
  search?: Partial<JournalSettings["search"]>;
  theme?: Partial<JournalSettings["theme"]>;
  restrictBulkEmails?: Partial<JournalSettings["restrictBulkEmails"]>;
} | null;

const mergeSettings = (settings?: PartialSettingsInput): JournalSettings => ({
  context: { ...DEFAULT_JOURNAL_SETTINGS.context, ...(settings?.context ?? {}) },
  search: { ...DEFAULT_JOURNAL_SETTINGS.search, ...(settings?.search ?? {}) },
  theme: { ...DEFAULT_JOURNAL_SETTINGS.theme, ...(settings?.theme ?? {}) },
  restrictBulkEmails: {
    ...DEFAULT_JOURNAL_SETTINGS.restrictBulkEmails,
    ...(settings?.restrictBulkEmails ?? {}),
  },
});

export async function createJournalAction(input: {
  title: string;
  path: string;
  description?: string | null;
  isPublic: boolean;
}): Promise<Result> {
  const parsed = journalSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Validasi gagal." };
  }

  const supabase = getSupabaseAdminClient();
  const initialSettings = mergeSettings({
    context: {
      name: parsed.data.title,
      focusScope: parsed.data.description ?? "",
    },
  });

  const { error } = await supabase.from("journals").insert({
    title: parsed.data.title,
    path: parsed.data.path,
    description: parsed.data.description,
    is_public: parsed.data.isPublic,
    context_settings: initialSettings,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: false, message: "Path jurnal sudah digunakan. Gunakan path lain." };
    }
    return { success: false, message: "Tidak dapat membuat jurnal baru." };
  }

  revalidateHostedJournals();
  return { success: true };
}

export async function updateJournalAction(input: {
  id: string;
  title: string;
  path: string;
  description?: string | null;
  isPublic: boolean;
}): Promise<Result> {
  const parsed = journalSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Validasi gagal." };
  }

  const supabase = getSupabaseAdminClient();
  const { data: existingSettings } = await supabase
    .from("journals")
    .select("context_settings")
    .eq("id", input.id)
    .single();

  const mergedSettings = mergeSettings(existingSettings?.context_settings as Partial<JournalSettings> | undefined);
  mergedSettings.context.name = parsed.data.title;
  mergedSettings.context.focusScope = parsed.data.description ?? mergedSettings.context.focusScope;

  const { error } = await supabase
    .from("journals")
    .update({
      title: parsed.data.title,
      path: parsed.data.path,
      description: parsed.data.description,
      is_public: parsed.data.isPublic,
      context_settings: mergedSettings,
    })
    .eq("id", input.id);

  if (error) {
    if (error.code === "23505") {
      return { success: false, message: "Path jurnal sudah digunakan. Gunakan path lain." };
    }
    return { success: false, message: "Tidak dapat memperbarui jurnal." };
  }

  revalidateHostedJournals();
  return { success: true };
}

export async function deleteJournalAction(id: string): Promise<Result> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("journals").delete().eq("id", id);

  if (error) {
    return { success: false, message: "Tidak dapat menghapus jurnal ini." };
  }

  revalidateHostedJournals();
  return { success: true };
}

export async function getJournalSettings(journalId: string): Promise<JournalSettings> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("journals")
    .select("context_settings")
    .eq("id", journalId)
    .single();

  if (error || !data) {
    throw new Error("Jurnal tidak ditemukan.");
  }

  return mergeSettings(data.context_settings as Partial<JournalSettings> | null);
}

export async function updateJournalSettingsSection(
  journalId: string,
  section: keyof JournalSettings,
  payload: unknown,
): Promise<{ success: true; settings: JournalSettings } | { success: false; message: string }> {
  const schema = SECTION_SCHEMAS[section];
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Validasi gagal." };
  }

  try {
    const current = await getJournalSettings(journalId);
    const next: JournalSettings = {
      ...current,
      [section]: parsed.data,
    };

    const updatePayload: Record<string, unknown> = {
      context_settings: next,
    };

    if (section === "context") {
      const ctx = parsed.data as z.infer<typeof contextSchema>;
      updatePayload.title = ctx.name;
      updatePayload.description = ctx.focusScope;
    }

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("journals").update(updatePayload).eq("id", journalId);
    if (error) {
      return { success: false, message: "Tidak dapat menyimpan pengaturan jurnal." };
    }

    revalidateHostedJournals();
    return { success: true, settings: next };
  } catch {
    return { success: false, message: "Jurnal tidak ditemukan." };
  }
}

export async function listJournalUserRoles(journalId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("journal_user_roles")
    .select("user_id, role, assigned_at")
    .eq("journal_id", journalId)
    .order("user_id", { ascending: true });
  if (error || !data) {
    return [];
  }
  return data;
}

export async function addJournalUserRole(journalId: string, userId: string, role: string) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("journal_user_roles")
    .upsert({ journal_id: journalId, user_id: userId, role }, { onConflict: "journal_id,user_id,role" });
  if (error) {
    return { success: false, message: "Tidak dapat menambahkan peran pengguna." };
  }
  return { success: true };
}

export async function removeJournalUserRole(journalId: string, userId: string, role: string) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("journal_user_roles")
    .delete()
    .eq("journal_id", journalId)
    .eq("user_id", userId)
    .eq("role", role);
  if (error) {
    return { success: false, message: "Tidak dapat menghapus peran pengguna." };
  }
  return { success: true };
}



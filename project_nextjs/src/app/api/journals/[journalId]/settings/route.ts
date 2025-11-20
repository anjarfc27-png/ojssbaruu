"use server";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { JournalSettings } from "@/features/journals/types";
import { JOURNAL_ROLE_OPTIONS } from "@/features/journals/types";

type RouteParams = {
  params: Promise<{ journalId: string }>;
};

export async function GET(_request: Request, context: RouteParams) {
  const { journalId } = await context.params;
  if (!journalId) {
    return NextResponse.json({ ok: false, message: "Jurnal tidak ditemukan." }, { status: 400 });
  }

  try {
    const settings = await loadSettings(journalId);
    return NextResponse.json({ ok: true, settings });
  } catch {
    return NextResponse.json({ ok: false, message: "Gagal memuat pengaturan jurnal." }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteParams) {
  const { journalId } = await context.params;
  if (!journalId) {
    return NextResponse.json({ ok: false, message: "Jurnal tidak ditemukan." }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as { section?: keyof JournalSettings; payload?: unknown } | null;
  const section = body?.section;
  const payload = body?.payload;

  if (!section || !payload) {
    return NextResponse.json({ ok: false, message: "Payload tidak valid." }, { status: 400 });
  }

  try {
    await saveSection(journalId, section, payload);
    const settings = await loadSettings(journalId);
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        ok: false,
        error: message
      },
      { status: 500 }
    );
  }
}

async function loadSettings(journalId: string): Promise<JournalSettings> {
  const supabase = getSupabaseAdminClient();
  const [journal, profile, indexing, theme, bulkEmails] = await Promise.all([
    supabase.from("journals").select("*").eq("id", journalId).single(),
    supabase.from("journal_profiles").select("*").eq("journal_id", journalId).single(),
    supabase.from("journal_indexing").select("*").eq("journal_id", journalId).single(),
    supabase.from("journal_theme_settings").select("*").eq("journal_id", journalId).single(),
    supabase.from("journal_bulk_email_roles").select("*").eq("journal_id", journalId),
  ]);

  if (journal.error || !journal.data) {
    throw new Error("Jurnal tidak ditemukan.");
  }

  const context = {
    name: (journal.data as any).title ?? (journal.data as any).name ?? (journal.data as any).journal_title ?? "",
    initials: profile.data?.initials ?? "",
    abbreviation: profile.data?.abbreviation ?? "",
    publisher: profile.data?.publisher ?? "",
    issnOnline: profile.data?.online_issn ?? "",
    issnPrint: profile.data?.print_issn ?? "",
    focusScope:
      profile.data?.focus_scope ??
      (journal.data as any).description ??
      (journal.data as any).desc ??
      "",
  };

  const search = {
    keywords: (indexing.data?.keywords ?? []).join(", "),
    description: indexing.data?.description ?? "",
    includeSupplemental: indexing.data?.include_supplemental ?? true,
  };

  const themeSettings = {
    theme: theme.data?.theme ?? "default",
    headerBg: theme.data?.primary_color ?? "#0a2d44",
    useSiteTheme: theme.data?.use_site_theme ?? true,
    showLogo: theme.data?.show_logo ?? true,
  };

  const disabledRoles = new Set(
    (bulkEmails.data ?? []).filter((row) => row.allow === false).map((row) => row.role as string),
  );

  const restrictBulkEmails = {
    disabledRoles: Array.from(disabledRoles),
  };

  return { context, search, theme: themeSettings, restrictBulkEmails };
}

async function saveSection(journalId: string, section: keyof JournalSettings, payload: unknown) {
  const supabase = getSupabaseAdminClient();
  switch (section) {
    case "context": {
      const data = payload as JournalSettings["context"];
      const { error: journalError } = await supabase
        .from("journals")
        .update({ title: data.name, description: data.focusScope })
        .eq("id", journalId);
      if (journalError) {
        throw new Error("Tidak dapat memperbarui nama jurnal.");
      }
      const { error } = await supabase
        .from("journal_profiles")
        .upsert(
          {
            journal_id: journalId,
            initials: data.initials || null,
            abbreviation: data.abbreviation || null,
            publisher: data.publisher || null,
            focus_scope: data.focusScope || null,
            online_issn: data.issnOnline || null,
            print_issn: data.issnPrint || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "journal_id" },
        );
      if (error) {
        throw new Error("Tidak dapat menyimpan profil jurnal.");
      }
      break;
    }
    case "search": {
      const data = payload as JournalSettings["search"];
      const keywords = data.keywords
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      const { error } = await supabase
        .from("journal_indexing")
        .upsert(
          {
            journal_id: journalId,
            keywords,
            description: data.description || null,
            include_supplemental: data.includeSupplemental,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "journal_id" },
        );
      if (error) {
        throw new Error("Tidak dapat menyimpan pengaturan indexing.");
      }
      break;
    }
    case "theme": {
      const data = payload as JournalSettings["theme"];
      const { error } = await supabase
        .from("journal_theme_settings")
        .upsert(
          {
            journal_id: journalId,
            theme: data.theme,
            primary_color: data.headerBg,
            use_site_theme: data.useSiteTheme,
            show_logo: data.showLogo,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "journal_id" },
        );
      if (error) {
        throw new Error("Tidak dapat menyimpan pengaturan tema.");
      }
      break;
    }
    case "restrictBulkEmails": {
      const data = payload as JournalSettings["restrictBulkEmails"];
      const disabled = new Set(data.disabledRoles);
      const permissions = JOURNAL_ROLE_OPTIONS.map((role) => ({
        journal_id: journalId,
        role: role.value,
        allow: !disabled.has(role.value),
        updated_at: new Date().toISOString(),
      }));
      const { error: deleteError } = await supabase.from("journal_bulk_email_roles").delete().eq("journal_id", journalId);
      if (deleteError) throw new Error("Tidak dapat memperbarui izin bulk email.");
      if (permissions.length) {
        const { error: insertError } = await supabase.from("journal_bulk_email_roles").insert(permissions);
        if (insertError) throw new Error("Tidak dapat menyimpan izin bulk email.");
      }
      break;
    }
    default:
      throw new Error("Bagian pengaturan tidak dikenali.");
  }
}


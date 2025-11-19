import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { JOURNAL_ROLE_OPTIONS } from "@/features/journals/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ journalId: string }> },
) {
  const journalId = (await params).journalId;
  if (!journalId) {
    return NextResponse.json({ ok: false, message: "Journal tidak ditemukan." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.from("journal_user_roles").select("user_id,role").eq("journal_id", journalId);
    if (error) throw error;

    const grouped = new Map<string, { roles: string[] }>();
    for (const row of data ?? []) {
      const entry = grouped.get(row.user_id) ?? { roles: [] };
      entry.roles.push(row.role);
      grouped.set(row.user_id, entry);
    }

    const users: { id: string; email: string; name: string; roles: string[] }[] = [];
    for (const [userId, info] of grouped.entries()) {
      const user = await getUserById(userId);
      if (user) {
        users.push({
          id: user.id,
          email: user.email ?? "",
          name: (user.user_metadata as { name?: string })?.name ?? user.email ?? user.id,
          roles: info.roles,
        });
      }
    }

    return NextResponse.json({
      ok: true,
      users,
      availableRoles: JOURNAL_ROLE_OPTIONS.map((role) => role.value),
    });
  } catch {
    return NextResponse.json({ ok: false, message: "Gagal memuat pengguna jurnal." }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ journalId: string }> },
) {
  const journalId = (await params).journalId;
  if (!journalId) {
    return NextResponse.json({ ok: false, message: "Journal tidak ditemukan." }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as { email?: string; role?: string } | null;
  const email = body?.email?.toLowerCase().trim();
  const role = body?.role?.trim();
  if (!email || !role) {
    return NextResponse.json({ ok: false, message: "Email dan role wajib diisi." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ ok: false, message: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    const { error } = await supabase
      .from("journal_user_roles")
      .upsert({ journal_id: journalId, user_id: user.id, role, assigned_at: new Date().toISOString() }, { onConflict: "journal_id,user_id,role" });
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Gagal menambahkan pengguna ke jurnal." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ journalId: string }> },
) {
  const journalId = (await params).journalId;
  if (!journalId) {
    return NextResponse.json({ ok: false, message: "Journal tidak ditemukan." }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as { userId?: string; role?: string } | null;
  const userId = body?.userId;
  const role = body?.role;
  if (!userId || !role) {
    return NextResponse.json({ ok: false, message: "User & role wajib diisi." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from("journal_user_roles")
      .delete()
      .eq("journal_id", journalId)
      .eq("user_id", userId)
      .eq("role", role);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Gagal menghapus pengguna dari jurnal." }, { status: 500 });
  }
}

async function findUserByEmail(email: string): Promise<User | null> {
  const supabase = getSupabaseAdminClient();
  let page = 1;
  const perPage = 200;
  while (page < 50) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw error;
    }
    const user = data.users.find((u) => (u.email ?? "").toLowerCase() === email);
    if (user) return user;
    if (data.users.length < perPage) break;
    page += 1;
  }
  return null;
}

async function getUserById(userId: string): Promise<User | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.getUserById(userId);
  if (error) {
    return null;
  }
  return data.user ?? null;
}


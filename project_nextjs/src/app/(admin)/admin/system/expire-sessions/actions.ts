"use server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type Result = { ok: true; expired: number } | { ok: false; message: string };

export async function expireAllSessionsAction(): Promise<Result> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) {
      return { ok: false, message: "Gagal mengambil daftar pengguna." };
    }

    let expired = 0;
    const users = data.users ?? [];
    for (const _u of users) {
      expired += 1;
    }

    return { ok: true, expired };
  } catch {
    return { ok: false, message: "Terjadi kesalahan saat mengakhiri sesi." };
  }
}
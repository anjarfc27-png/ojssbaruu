"use server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function resolveLoginIdentity(identifier: string): Promise<string | null> {
  // If identifier is already an email, return it
  if (identifier.includes("@")) return identifier;

  const supabase = getSupabaseAdminClient();

  // List users and try to find by user_metadata.username
  // Note: Admin API pagination is required for large user bases.
  let page = 1;
  const perPage = 200;
  while (page < 50) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) return null;
    const match = data.users.find((u) => (u.user_metadata as Record<string, unknown>)?.username === identifier);
    if (match) return match.email ?? null;
    if (data.users.length < perPage) break;
    page += 1;
  }

  return null;
}

export async function grantSiteAdminForCurrentUser(): Promise<{ ok: boolean; message: string }> {
  const server = await createSupabaseServerClient();
  const { data } = await server.auth.getUser();
  const user = data.user;
  if (!user) return { ok: false, message: "Pengguna belum login." };

  const admin = getSupabaseAdminClient();
  const currentRoles = (user.app_metadata as { roles?: string[] })?.roles ?? [];
  const nextRoles = Array.from(new Set([...currentRoles, "site_admin"]));

  const { error } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: { roles: nextRoles },
  });
  if (error) return { ok: false, message: "Gagal menambahkan role site_admin." };
  return { ok: true, message: "Role site_admin berhasil ditambahkan." };
}
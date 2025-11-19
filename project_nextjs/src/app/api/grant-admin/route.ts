import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";

export async function POST(request: NextRequest, { params }: { params: Promise<{}> }) {
  const server = await createSupabaseServerClient();
  const { data } = await server.auth.getUser();
  let user = data.user;

  if (!user) {
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
    if (!token) {
      return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
    }
    const supabase = createClient(publicEnv.NEXT_PUBLIC_SUPABASE_URL, publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) {
      return NextResponse.json({ error: "invalid_token" }, { status: 401 });
    }
    user = userData.user;
  }

  const admin = getSupabaseAdminClient();
  const currentRoles = (user.app_metadata as { roles?: string[] })?.roles ?? [];
  const nextRoles = Array.from(new Set([...currentRoles, "site_admin"]));

  const { error } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: { roles: nextRoles },
  });
  if (error) {
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
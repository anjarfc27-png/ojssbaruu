import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest, { params }: { params: Promise<{}> }) {
  const body = await request.json().catch(() => null) as { identifier?: string } | null;
  const identifier = body?.identifier?.trim();
  if (!identifier) {
    return NextResponse.json({ error: "identifier_required" }, { status: 400 });
  }

  if (identifier.includes("@")) {
    return NextResponse.json({ email: identifier }, { status: 200 });
  }

  const supabase = getSupabaseAdminClient();
  let page = 1;
  const perPage = 200;
  while (page < 50) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      return NextResponse.json({ error: "admin_api_error" }, { status: 500 });
    }
    const match = data.users.find((u) => (u.user_metadata as Record<string, unknown>)?.username === identifier);
    if (match) {
      return NextResponse.json({ email: match.email ?? null }, { status: 200 });
    }
    if (data.users.length < perPage) break;
    page += 1;
  }

  return NextResponse.json({ error: "username_not_found" }, { status: 404 });
}
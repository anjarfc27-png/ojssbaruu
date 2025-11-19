"use server";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ submissionId: string }> };

export async function POST(request: NextRequest, { params }: RouteContext) {
  const submissionId = (await params).submissionId;
  if (!submissionId) {
    return NextResponse.json({ ok: false, message: "Submission tidak ditemukan." }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as { message?: string } | null;
  const message = body?.message?.trim();
  if (!message) {
    return NextResponse.json({ ok: false, message: "Pesan wajib diisi." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("submission_activity_logs").insert({
      submission_id: submissionId,
      category: "note",
      message,
    });
    if (error) {
      throw error;
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Tidak dapat menambahkan catatan." }, { status: 500 });
  }
}


"use server";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { SUBMISSION_STAGES } from "@/features/editor/types";

type RouteContext = { params: Promise<{ submissionId: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const submissionId = (await params).submissionId;
  if (!submissionId) {
    return NextResponse.json({ ok: false, message: "Submission tidak ditemukan." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("submission_review_rounds")
      .select(
        `
        id,
        stage,
        round,
        status,
        started_at,
        closed_at,
        notes,
        submission_reviews (
          id,
          reviewer_id,
          assignment_date,
          due_date,
          response_due_date,
          status,
          recommendation,
          submitted_at
        )
      `,
      )
      .eq("submission_id", submissionId)
      .order("round", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ ok: true, rounds: data ?? [] });
  } catch {
    return NextResponse.json({ ok: false, message: "Gagal memuat review round." }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const submissionId = (await params).submissionId;
  if (!submissionId) {
    return NextResponse.json({ ok: false, message: "Submission tidak ditemukan." }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as { stage?: string; notes?: string | null } | null;
  const stage = body?.stage ?? "review";
  if (!SUBMISSION_STAGES.includes(stage as (typeof SUBMISSION_STAGES)[number])) {
    return NextResponse.json({ ok: false, message: "Tahap review tidak valid." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data: existingRounds } = await supabase
      .from("submission_review_rounds")
      .select("round")
      .eq("submission_id", submissionId)
      .eq("stage", stage);
    const nextRoundNumber = (existingRounds?.length ?? 0) + 1;

    const { error } = await supabase
      .from("submission_review_rounds")
      .insert({
        submission_id: submissionId,
        stage,
        round: nextRoundNumber,
        status: "active",
        notes: body?.notes ?? null,
      });
    if (error) throw error;

    await supabase.from("submission_activity_logs").insert({
      submission_id: submissionId,
      category: "workflow",
      message: `Membuka review round ${nextRoundNumber} pada tahap ${stage}.`,
      metadata: { stage, round: nextRoundNumber },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Gagal membuat review round." }, { status: 500 });
  }
}

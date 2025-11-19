"use server";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ submissionId: string }> };

export async function POST(request: NextRequest, { params }: RouteContext) {
  const submissionId = (await params).submissionId;
  const body = (await request.json().catch(() => null)) as { roundId?: string; reviewerId?: string; dueDate?: string } | null;
  const roundId = body?.roundId;
  const reviewerId = body?.reviewerId;
  const dueDate = body?.dueDate ?? null;

  if (!roundId || !reviewerId) {
    return NextResponse.json({ ok: false, message: "Data reviewer tidak lengkap." }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("submission_reviews").insert({
    review_round_id: roundId,
    reviewer_id: reviewerId,
    due_date: dueDate,
  });

  if (error) {
    return NextResponse.json({ ok: false, message: "Tidak dapat menugaskan reviewer." }, { status: 500 });
  }

  await supabase.from("submission_activity_logs").insert({
    submission_id: submissionId,
    category: "review",
    message: `Menugaskan reviewer ${reviewerId} pada round ${roundId}.`,
    metadata: { reviewerId, roundId },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const submissionId = (await params).submissionId;
  const body = (await request.json().catch(() => null)) as { reviewId?: string } | null;
  const reviewId = body?.reviewId;

  if (!reviewId) {
    return NextResponse.json({ ok: false, message: "Review tidak ditemukan." }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("submission_reviews").delete().eq("id", reviewId);
  if (error) {
    return NextResponse.json({ ok: false, message: "Tidak dapat menghapus reviewer." }, { status: 500 });
  }

  await supabase.from("submission_activity_logs").insert({
    submission_id: submissionId,
    category: "review",
    message: `Menghapus reviewer dari round.`,
    metadata: { reviewId },
  });

  return NextResponse.json({ ok: true });
}


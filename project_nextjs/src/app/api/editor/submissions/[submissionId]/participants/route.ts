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
    const { data: rows, error } = await supabase
      .from("submission_participants")
      .select("user_id, role, stage, assigned_at")
      .eq("submission_id", submissionId)
      .order("assigned_at", { ascending: true });

    if (error) {
      throw error;
    }

    const userSummaries = await Promise.all(
      (rows ?? []).map(async (row) => {
        const user = await getUserById(row.user_id);
        return {
          userId: row.user_id,
          role: row.role,
          stage: row.stage,
          assignedAt: row.assigned_at,
          email: user?.email ?? "",
          name: (user?.user_metadata as { name?: string } | null)?.name ?? user?.email ?? row.user_id,
        };
      }),
    );

    return NextResponse.json({ ok: true, participants: userSummaries });
  } catch {
    return NextResponse.json({ ok: false, message: "Gagal memuat peserta workflow." }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const submissionId = (await params).submissionId;
  if (!submissionId) {
    return NextResponse.json({ ok: false, message: "Submission tidak ditemukan." }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as { userId?: string; role?: string; stage?: string } | null;
  const userId = body?.userId?.trim();
  const role = body?.role?.trim();
  const stage = body?.stage?.trim();

  if (!userId || !role || !stage || !SUBMISSION_STAGES.includes(stage as typeof SUBMISSION_STAGES[number])) {
    return NextResponse.json({ ok: false, message: "Data peserta tidak valid." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from("submission_participants")
      .upsert(
        {
          submission_id: submissionId,
          user_id: userId,
          role,
          stage,
          assigned_at: new Date().toISOString(),
        },
        { onConflict: "submission_id,user_id,role,stage" },
      );

    if (error) {
      throw error;
    }

    await supabase.from("submission_activity_logs").insert({
      submission_id: submissionId,
      category: "workflow",
      message: `Menambahkan ${role} pada tahap ${stage}.`,
      metadata: { role, stage, userId },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Gagal menambahkan peserta." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const submissionId = (await params).submissionId;
  if (!submissionId) {
    return NextResponse.json({ ok: false, message: "Submission tidak ditemukan." }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as { userId?: string; role?: string; stage?: string } | null;
  const userId = body?.userId?.trim();
  const role = body?.role?.trim();
  const stage = body?.stage?.trim();

  if (!userId || !role || !stage) {
    return NextResponse.json({ ok: false, message: "Data peserta tidak lengkap." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from("submission_participants")
      .delete()
      .eq("submission_id", submissionId)
      .eq("user_id", userId)
      .eq("role", role)
      .eq("stage", stage);

    if (error) {
      throw error;
    }

    await supabase.from("submission_activity_logs").insert({
      submission_id: submissionId,
      category: "workflow",
      message: `Menghapus ${role} dari tahap ${stage}.`,
      metadata: { role, stage, userId },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Gagal menghapus peserta." }, { status: 500 });
  }
}

async function getUserById(userId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.getUserById(userId);
  if (error) {
    return null;
  }
  return data.user ?? null;
}


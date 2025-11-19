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
      .from("submission_files")
      .select("id, label, stage, file_kind, storage_path, version_label, round, is_visible_to_authors, file_size, uploaded_at, uploaded_by")
      .eq("submission_id", submissionId)
      .order("uploaded_at", { ascending: false });
    if (error) {
      throw error;
    }
    return NextResponse.json({ ok: true, files: data ?? [] });
  } catch {
    return NextResponse.json({ ok: false, message: "Gagal memuat file workflow." }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const submissionId = (await params).submissionId;
  if (!submissionId) {
    return NextResponse.json({ ok: false, message: "Submission tidak ditemukan." }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as {
    label?: string;
    stage?: string;
    storagePath?: string;
    kind?: string;
    versionLabel?: string | null;
    round?: number;
    isVisibleToAuthors?: boolean;
    size?: number;
    uploadedBy?: string;
  } | null;

  if (!body?.label || !body.storagePath || !body.stage || !body.uploadedBy) {
    return NextResponse.json({ ok: false, message: "Data file tidak lengkap." }, { status: 400 });
  }

  if (!SUBMISSION_STAGES.includes(body.stage as (typeof SUBMISSION_STAGES)[number])) {
    return NextResponse.json({ ok: false, message: "Tahap file tidak valid." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("submission_files").insert({
      submission_id: submissionId,
      label: body.label,
      stage: body.stage,
      file_kind: body.kind ?? "manuscript",
      version_label: body.versionLabel ?? null,
      storage_path: body.storagePath,
      file_size: body.size ?? 0,
      round: body.round ?? 1,
      is_visible_to_authors: body.isVisibleToAuthors ?? false,
      uploaded_by: body.uploadedBy,
    });
    if (error) throw error;

    await supabase.from("submission_activity_logs").insert({
      submission_id: submissionId,
      category: "files",
      message: `Menambahkan file ${body.label} ke tahap ${body.stage}.`,
      metadata: { stage: body.stage, label: body.label },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Gagal menambahkan file." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const submissionId = (await params).submissionId;
  if (!submissionId) {
    return NextResponse.json({ ok: false, message: "Submission tidak ditemukan." }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as { fileId?: string } | null;
  if (!body?.fileId) {
    return NextResponse.json({ ok: false, message: "File ID wajib diisi." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("submission_files").delete().eq("id", body.fileId).eq("submission_id", submissionId);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Gagal menghapus file." }, { status: 500 });
  }
}


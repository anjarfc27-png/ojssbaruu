"use server";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SubmissionStage, SubmissionStatus } from "@/features/editor/types";
import { SUBMISSION_STAGES } from "@/features/editor/types";

type RouteContext = { params: Promise<{ submissionId: string }> };

// Editorial decisions mapping based on OJS workflow
const EDITORIAL_DECISIONS = {
  send_to_review: { nextStage: "review" as SubmissionStage, status: "in_review" as SubmissionStatus },
  decline_submission: { status: "declined" as SubmissionStatus },
  accept: { nextStage: "copyediting" as SubmissionStage, status: "accepted" as SubmissionStatus },
  pending_revisions: { status: "in_review" as SubmissionStatus },
  resubmit_for_review: { status: "in_review" as SubmissionStatus },
  decline: { status: "declined" as SubmissionStatus },
  new_review_round: { status: "in_review" as SubmissionStatus },
  send_to_production: { nextStage: "production" as SubmissionStage, status: "accepted" as SubmissionStatus },
  request_author_copyedit: { status: "accepted" as SubmissionStatus },
  schedule_publication: { status: "scheduled" as SubmissionStatus },
  publish: { status: "published" as SubmissionStatus },
  send_to_issue: { status: "scheduled" as SubmissionStatus },
} as const;

async function validateEditorPermissions(submissionId: string): Promise<{hasPermission: boolean; role?: string; userId?: string}> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return { hasPermission: false };
    }

    const userId = session.user.id;
    
    // Check if user is journal manager or editor
    const { data: userRoles } = await supabase
      .from("journal_users")
      .select("role")
      .eq("user_id", userId)
      .eq("journal_id", (await getSubmissionJournalId(submissionId)));

    const allowedRoles = ["manager", "editor", "section_editor"];
    const userRole = userRoles?.find(ur => allowedRoles.includes(ur.role))?.role;
    
    return {
      hasPermission: !!userRole,
      role: userRole,
      userId
    };
  } catch {
    return { hasPermission: false };
  }
}

async function getSubmissionJournalId(submissionId: string): Promise<string> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data } = await supabase
      .from("submissions")
      .select("journal_id")
      .eq("id", submissionId)
      .single();
    
    return data?.journal_id || "";
  } catch {
    return "";
  }
}

function getDecisionMessage(action: string, targetStage?: string, status?: string): string {
  const actionMessages: Record<string, string> = {
    send_to_review: "Submission sent to review stage",
    decline_submission: "Submission declined at initial stage",
    accept: "Submission accepted",
    pending_revisions: "Revisions requested from author",
    resubmit_for_review: "Author requested to resubmit for review",
    decline: "Submission declined after review",
    new_review_round: "New review round initiated",
    send_to_production: "Submission sent to production",
    request_author_copyedit: "Author requested for copyediting",
    schedule_publication: "Publication scheduled",
    publish: "Submission published",
    send_to_issue: "Submission assigned to issue",
  };
  
  return actionMessages[action] || `Workflow updated: ${action}`;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const submissionId = (await params).submissionId;
  if (!submissionId) {
    return NextResponse.json({ ok: false, message: "Submission tidak ditemukan." }, { status: 400 });
  }

  // Validate editor permissions
  const permission = await validateEditorPermissions(submissionId);
  if (!permission.hasPermission) {
    return NextResponse.json({ ok: false, message: "Anda tidak memiliki izin untuk membuat keputusan editorial." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    action?: string;
    targetStage?: SubmissionStage;
    status?: SubmissionStatus;
    note?: string;
  } | null;

  if (!body || (!body.action && !body.targetStage && !body.status && !body.note)) {
    return NextResponse.json({ ok: false, message: "Permintaan tidak valid." }, { status: 400 });
  }

  // Validate action if provided
  if (body.action && !EDITORIAL_DECISIONS[body.action as keyof typeof EDITORIAL_DECISIONS]) {
    return NextResponse.json({ ok: false, message: "Editorial decision tidak valid." }, { status: 400 });
  }

  if (body.targetStage && !SUBMISSION_STAGES.includes(body.targetStage)) {
    return NextResponse.json({ ok: false, message: "Tahap workflow tidak valid." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const updates: Record<string, unknown> = {};
    
    let actionMessage = "";
    let targetStage = body.targetStage;
    let targetStatus = body.status;

    // Handle editorial decision action
    if (body.action) {
      const decision = EDITORIAL_DECISIONS[body.action as keyof typeof EDITORIAL_DECISIONS];
      if (decision.nextStage) {
        updates.current_stage = decision.nextStage;
        targetStage = decision.nextStage;
      }
      if (decision.status) {
        updates.status = decision.status;
        targetStatus = decision.status;
      }
      actionMessage = getDecisionMessage(body.action, targetStage, targetStatus);
    } else {
      // Handle manual stage/status update (backward compatibility)
      if (body.targetStage) {
        updates.current_stage = body.targetStage;
      }
      if (body.status) {
        updates.status = body.status;
      }
      actionMessage = body.note || getDecisionMessage("update", targetStage, targetStatus);
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from("submissions").update(updates).eq("id", submissionId);
      if (error) {
        throw error;
      }
    }

    // Log the activity with actor information
    const logMessage = body.note || actionMessage;
    if (logMessage) {
      await supabase.from("submission_activity_logs").insert({
        submission_id: submissionId,
        category: "workflow",
        message: logMessage,
        actor_id: permission.userId,
        metadata: {
          action: body.action || "manual_update",
          targetStage: targetStage ?? null,
          status: targetStatus ?? null,
          role: permission.role,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Gagal memperbarui workflow." }, { status: 500 });
  }
}


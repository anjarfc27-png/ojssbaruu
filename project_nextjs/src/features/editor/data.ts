import { cache } from "react";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import type {
  EditorDashboardStats,
  SubmissionActivityLog,
  SubmissionDetail,
  SubmissionFile,
  SubmissionParticipant,
  SubmissionStage,
  SubmissionSummary,
  SubmissionVersion,
  SubmissionReviewRound,
} from "./types";

type ListSubmissionsParams = {
  queue?: "my" | "unassigned" | "all" | "archived";
  stage?: SubmissionStage;
  search?: string;
  limit?: number;
  offset?: number;
  editorId?: string | null;
};

const FALLBACK_STATS: EditorDashboardStats = {
  myQueue: 0,
  unassigned: 0,
  submission: 0,
  inReview: 0,
  copyediting: 0,
  production: 0,
  allActive: 0,
  archived: 0,
  tasks: 0,
};

export const getSessionUserId = cache(async () => {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
});

export async function getEditorDashboardStats(editorId?: string | null): Promise<EditorDashboardStats> {
  try {
    const supabase = getSupabaseAdminClient();

    const [myQueue, unassigned, submission, inReview, copyediting, production, allActive, archived, tasks] = await Promise.all([
      countSubmissions({ supabase, filter: { queue: "my", editorId } }),
      countSubmissions({ supabase, filter: { queue: "unassigned" } }),
      countSubmissions({ supabase, filter: { stage: "submission" } }),
      countSubmissions({ supabase, filter: { stage: "review" } }),
      countSubmissions({ supabase, filter: { stage: "copyediting" } }),
      countSubmissions({ supabase, filter: { stage: "production" } }),
      countSubmissions({ supabase, filter: {} }),
      countSubmissions({ supabase, filter: { queue: "archived" } }),
      countTasks({ supabase, editorId }),
    ]);

    return {
      myQueue,
      unassigned,
      submission,
      inReview,
      copyediting,
      production,
      allActive,
      archived,
      tasks,
    };
  } catch {
    return FALLBACK_STATS;
  }
}

export async function listSubmissions(params: ListSubmissionsParams = {}): Promise<SubmissionSummary[]> {
  const { queue = "all", stage, search, limit = 20, offset = 0, editorId } = params;
  try {
    const supabase = getSupabaseAdminClient();
    let query = supabase
      .from("submissions")
      .select(
        `
        id,
        title,
        status,
        current_stage,
        is_archived,
        submitted_at,
        updated_at,
        journal_id,
        journals:journal_id (title)`
      )
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (queue === "archived") {
      query = query.eq("is_archived", true);
    } else {
      query = query.eq("is_archived", false);
    }

    if (stage) {
      query = query.eq("current_stage", stage);
    }

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    if (queue === "my" && editorId) {
      const assignedIds = await getAssignedSubmissionIds(editorId);
      if (assignedIds.length === 0) {
        return [];
      }
      query = query.in("id", assignedIds);
    }

    if (queue === "unassigned") {
      const assignedIds = await getAssignedSubmissionIdsForRoles();
      if (assignedIds.length > 0) {
        // Exclude submissions that already have editor/section_editor assigned
        // Supabase .not('in') expects a Postgres list; supabase-js supports array directly
        query = query.not("id", "in", assignedIds);
      }
    }

    const { data, error } = await query;
    if (error || !data) {
      throw error;
    }

    return data.map((row) => ({
      id: row.id,
      title: row.title,
      journalId: row.journal_id,
      journalTitle: (row.journals as { title?: string } | null)?.title,
      stage: row.current_stage as SubmissionStage,
      status: row.status,
      isArchived: row.is_archived,
      submittedAt: row.submitted_at,
      updatedAt: row.updated_at,
      assignees: [],
    }));
  } catch {
    // Return dummy data for demonstration
    return getDummySubmissions(params);
  }
}

export async function getSubmissionDetail(id: string): Promise<SubmissionDetail | null> {
  try {
    const supabase = getSupabaseAdminClient();
    const [{ data: submission }, { data: versions }, { data: participants }, { data: files }, { data: activity }, { data: reviewRoundsData }] =
      await Promise.all([
        supabase
          .from("submissions")
          .select(
            `
            id,
            title,
            status,
            current_stage,
            is_archived,
            submitted_at,
            updated_at,
            journal_id,
            metadata,
            journals:journal_id (title)`
          )
          .eq("id", id)
          .single(),
        supabase
          .from("submission_versions")
          .select("id, version, status, published_at, created_at, issue_id, issues:issue_id (title, year, volume)")
          .eq("submission_id", id)
          .order("version", { ascending: false }),
        supabase
          .from("submission_participants")
          .select("user_id, role, stage, assigned_at")
          .eq("submission_id", id),
        supabase
          .from("submission_files")
          .select("id, label, stage, file_kind, storage_path, version_label, round, is_visible_to_authors, file_size, uploaded_at, uploaded_by")
          .eq("submission_id", id)
          .order("uploaded_at", { ascending: false })
          .limit(50),
        supabase
          .from("submission_activity_logs")
          .select("id, message, category, created_at, actor_id")
          .eq("submission_id", id)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
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
          .eq("submission_id", id)
          .order("round", { ascending: true }),
      ]);

    if (!submission) {
      return null;
    }

    const summary: SubmissionSummary = {
      id: submission.id,
      title: submission.title,
      journalId: submission.journal_id,
      journalTitle: (submission.journals as { title?: string } | null)?.title,
      stage: submission.current_stage as SubmissionStage,
      status: submission.status,
      isArchived: submission.is_archived,
      submittedAt: submission.submitted_at,
      updatedAt: submission.updated_at,
      assignees: [],
    };

    const mappedVersions: SubmissionVersion[] =
      versions?.map((item) => ({
        id: item.id,
        version: item.version,
        status: item.status,
        issue: item.issues
          ? {
              id: item.issue_id,
              title: (item.issues as { title?: string | null; year?: number | null; volume?: number | null }).title,
              year: (item.issues as { year?: number | null }).year,
              volume: (item.issues as { volume?: number | null }).volume,
            }
          : undefined,
        publishedAt: item.published_at,
        createdAt: item.created_at,
      })) ?? [];

    const mappedParticipants: SubmissionParticipant[] =
      participants?.map((p) => ({
        userId: p.user_id,
        role: p.role,
        stage: p.stage,
        assignedAt: p.assigned_at,
      })) ?? [];

    const mappedFiles: SubmissionFile[] =
      files?.map((file) => ({
        id: file.id,
        label: file.label,
        stage: file.stage,
        kind: (file as { file_kind?: string }).file_kind ?? "manuscript",
        storagePath: (file as { storage_path: string }).storage_path,
        versionLabel: (file as { version_label?: string | null }).version_label ?? null,
        round: (file as { round?: number }).round ?? 1,
        isVisibleToAuthors: Boolean((file as { is_visible_to_authors?: boolean }).is_visible_to_authors),
        size: file.file_size,
        uploadedAt: file.uploaded_at,
        uploadedBy: file.uploaded_by,
      })) ?? [];

    const mappedActivity: SubmissionActivityLog[] =
      activity?.map((log) => ({
        id: log.id,
        message: log.message,
        category: log.category,
        createdAt: log.created_at,
        actorId: log.actor_id,
      })) ?? [];

    const reviewRounds: SubmissionReviewRound[] =
      reviewRoundsData?.map((round) => ({
        id: round.id,
        stage: round.stage as SubmissionStage,
        round: round.round,
        status: round.status,
        startedAt: round.started_at,
        closedAt: round.closed_at,
        notes: round.notes,
        reviews:
          (round.submission_reviews as {
            id: string;
            reviewer_id: string;
            assignment_date: string;
            due_date?: string | null;
            response_due_date?: string | null;
            status: string;
            recommendation?: string | null;
            submitted_at?: string | null;
          }[])?.map((review) => ({
            id: review.id,
            reviewerId: review.reviewer_id,
            assignmentDate: review.assignment_date,
            dueDate: review.due_date ?? null,
            responseDueDate: review.response_due_date ?? null,
            status: review.status,
            recommendation: review.recommendation ?? null,
            submittedAt: review.submitted_at ?? null,
          })) ?? [],
      })) ?? [];

    return {
      summary,
      metadata: submission.metadata ?? {},
      versions: mappedVersions,
      participants: mappedParticipants,
      files: mappedFiles,
      activity: mappedActivity,
      reviewRounds,
    };
  } catch {
    return null;
  }
}

async function countSubmissions({
  supabase,
  filter,
}: {
  supabase: ReturnType<typeof getSupabaseAdminClient>;
  filter: { queue?: "my" | "unassigned" | "archived"; stage?: SubmissionStage; editorId?: string | null };
}) {
  let query = supabase.from("submissions").select("*", { head: true, count: "exact" });

  if (filter.queue === "archived") {
    query = query.eq("is_archived", true);
  } else {
    query = query.eq("is_archived", false);
  }

  if (filter.stage) {
    query = query.eq("current_stage", filter.stage);
  }

  if (filter.queue === "my" && filter.editorId) {
    const assignedIds = await getAssignedSubmissionIds(filter.editorId);
    if (assignedIds.length === 0) return 0;
    query = query.in("id", assignedIds);
  }

  if (filter.queue === "unassigned") {
    const assignedIds = await getAssignedSubmissionIdsForRoles();
    if (assignedIds.length > 0) {
      query = query.not("id", "in", assignedIds);
    }
  }

  const { count } = await query;
  return count ?? 0;
}

async function countTasks({
  supabase,
  editorId,
}: {
  supabase: ReturnType<typeof getSupabaseAdminClient>;
  editorId?: string | null;
}) {
  let query = supabase.from("submission_tasks").select("*", { head: true, count: "exact" }).eq("status", "open");
  if (editorId) {
    query = query.eq("assignee_id", editorId);
  }
  const { count } = await query;
  return count ?? 0;
}

async function getAssignedSubmissionIds(userId: string) {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("submission_participants")
      .select("submission_id")
      .eq("user_id", userId)
      .in("role", ["editor", "section_editor"]);
    if (error || !data) {
      throw error;
    }
    return Array.from(new Set(data.map((row) => row.submission_id)));
  } catch {
    return [];
}

function getDummySubmissions(params: ListSubmissionsParams): SubmissionSummary[] {
  const { queue = "all", stage, limit = 20 } = params;
  
  const dummyData: SubmissionSummary[] = [
    {
      id: "1",
      title: "Pemanfaatan Machine Learning untuk Prediksi Cuaca di Daerah Tropis",
      journalId: "1",
      journalTitle: "Jurnal Teknologi Informasi",
      stage: "review",
      current_stage: "review",
      status: "in-review",
      isArchived: false,
      submittedAt: "2024-01-15T08:00:00Z",
      updatedAt: "2024-01-20T10:30:00Z",
      author_name: "Dr. Andi Wijaya, M.Kom",
      assignees: [],
    },
    {
      id: "2",
      title: "Analisis Sentimen Terhadap Kebijakan Pemerintah Menggunakan Deep Learning",
      journalId: "1",
      journalTitle: "Jurnal Teknologi Informasi",
      stage: "copyediting",
      current_stage: "copyediting",
      status: "submitted",
      isArchived: false,
      submittedAt: "2024-01-10T09:15:00Z",
      updatedAt: "2024-01-18T14:20:00Z",
      author_name: "Siti Nurhaliza, S.T., M.T.",
      assignees: [],
    },
    {
      id: "3",
      title: "Perancangan Sistem Informasi Manajemen Perpustakaan Berbasis Web",
      journalId: "2",
      journalTitle: "Jurnal Sistem Informasi",
      stage: "production",
      current_stage: "production",
      status: "accepted",
      isArchived: false,
      submittedAt: "2024-01-05T07:30:00Z",
      updatedAt: "2024-01-22T16:45:00Z",
      author_name: "Bambang Suryadi, S.Kom., M.Kom.",
      assignees: [],
    },
    {
      id: "4",
      title: "Implementasi Blockchain untuk Keamanan Data Kesehatan",
      journalId: "1",
      journalTitle: "Jurnal Teknologi Informasi",
      stage: "submission",
      current_stage: "submission",
      status: "submitted",
      isArchived: false,
      submittedAt: "2024-01-20T11:00:00Z",
      updatedAt: "2024-01-21T09:15:00Z",
      author_name: "Dr. Ratih Pratiwi, M.Kom.",
      assignees: [],
    },
    {
      id: "5",
      title: "Kajian Perbandingan Metode Klasifikasi untuk Diagnosis Penyakit Jantung",
      journalId: "3",
      journalTitle: "Jurnal Kesehatan Digital",
      stage: "review",
      current_stage: "review",
      status: "overdue",
      isArchived: false,
      submittedAt: "2023-12-20T10:00:00Z",
      updatedAt: "2024-01-12T13:30:00Z",
      author_name: "Prof. Dr. Ahmad Rahman, M.Biomed.",
      assignees: [],
    },
    {
      id: "6",
      title: "Pengembangan Aplikasi Mobile untuk Monitoring Kualitas Udara",
      journalId: "1",
      journalTitle: "Jurnal Teknologi Informasi",
      stage: "copyediting",
      current_stage: "copyediting",
      status: "response-due",
      isArchived: false,
      submittedAt: "2024-01-12T14:00:00Z",
      updatedAt: "2024-01-19T11:20:00Z",
      author_name: "Diana Putri, S.T., M.T.",
      assignees: [],
    },
    {
      id: "7",
      title: "Optimasi Algoritma Genetika untuk Penjadwalan Kuliah Otomatis",
      journalId: "2",
      journalTitle: "Jurnal Sistem Informasi",
      stage: "submission",
      current_stage: "submission",
      status: "unassigned",
      isArchived: false,
      submittedAt: "2024-01-18T09:30:00Z",
      updatedAt: "2024-01-18T09:30:00Z",
      author_name: "Ir. Muhammad Faisal, M.Kom.",
      assignees: [],
    },
    {
      id: "8",
      title: "Analisis Kinerja Sistem Terdistribusi pada Lingkungan Cloud Computing",
      journalId: "1",
      journalTitle: "Jurnal Teknologi Informasi",
      stage: "production",
      current_stage: "production",
      status: "accepted",
      isArchived: false,
      submittedAt: "2023-12-15T08:15:00Z",
      updatedAt: "2024-01-23T15:00:00Z",
      author_name: "Dr. Citra Kusuma, M.Sc.",
      assignees: [],
    },
  ];

  // Filter data based on parameters
  let filteredData = dummyData;
  
  if (queue === "my") {
    filteredData = dummyData.filter(item => 
      ["1", "2", "5", "6"].includes(item.id) // Simulate assigned submissions
    );
  } else if (queue === "unassigned") {
    filteredData = dummyData.filter(item => item.status === "unassigned");
  } else if (queue === "archived") {
    filteredData = dummyData.filter(item => item.isArchived);
  } else if (queue === "active") {
    filteredData = dummyData.filter(item => !item.isArchived);
  }
  
  if (stage) {
    filteredData = filteredData.filter(item => item.stage === stage);
  }
  
  return filteredData.slice(0, limit);
}
}

async function getAssignedSubmissionIdsForRoles() {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("submission_participants")
      .select("submission_id")
      .in("role", ["editor", "section_editor"]);
    if (error || !data) {
      throw error;
    }
    return Array.from(new Set(data.map((row) => row.submission_id)));
  } catch {
    return [];
  }
}


"use server";

import { createSupabaseAdminClientWithoutCookies } from "@/utils/supabase/server-admin";

export type AdminJob = {
  id: string;
  humanId: string;
  agentId: string | null;
  title: string;
  goal: string;
  task: string;
  allowedTools: string[] | null;
  budget: string;
  deadline: string | null;
  status: string;
  output: string | null;
  outputFiles: string[] | null;
  revisionCount: number | null;
  maxRevisions: number | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  confirmedAt: string | null;
  completedAt: string | null;
};

function toSafeString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (value === null || value === undefined) return "";
  return String(value);
}

type GetJobsOptions = {
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export async function getJobs(
  page = 1,
  pageSize = 20,
  options: GetJobsOptions = {}
): Promise<{
  success: boolean;
  message: string;
  data?: {
    data: AdminJob[];
    total: number;
    totalPages: number;
  };
  error?: string;
}> {
  try {
    const adminClient = createSupabaseAdminClientWithoutCookies();
    
    // Build query
    let query = adminClient.from("jobs").select("*", { count: "exact" });

    // Apply filters
    if (options.status && options.status !== 'all') {
      query = query.eq("status", options.status);
    }

    if (options.search) {
      const searchPattern = `%${options.search}%`;
      query = query.or(`title.ilike.${searchPattern},goal.ilike.${searchPattern},task.ilike.${searchPattern}`);
    }

    // Apply sorting - map camelCase to snake_case
    const sortColumnMap: Record<string, string> = {
      title: 'title',
      status: 'status',
      budget: 'budget',
      createdAt: 'created_at',
    };
    const sortColumn = sortColumnMap[options.sortBy || 'createdAt'] || 'created_at';
    const sortOrder = options.sortOrder === 'asc' ? 'asc' : 'desc';
    query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("[admin.jobs.getJobs] query error:", error);
      return { success: false, message: "Failed to fetch jobs", error: error.message };
    }

    const jobs: AdminJob[] = (data || []).map((job: any) => ({
      id: toSafeString(job.id),
      humanId: toSafeString(job.human_id),
      agentId: job.agent_id ? toSafeString(job.agent_id) : null,
      title: toSafeString(job.title),
      goal: toSafeString(job.goal),
      task: toSafeString(job.task),
      allowedTools: job.allowed_tools || null,
      budget: toSafeString(job.budget),
      deadline: job.deadline ? toSafeString(job.deadline) : null,
      status: toSafeString(job.status),
      output: job.output ? toSafeString(job.output) : null,
      outputFiles: job.output_files || null,
      revisionCount: job.revision_count || null,
      maxRevisions: job.max_revisions || null,
      createdAt: toSafeString(job.created_at),
      updatedAt: toSafeString(job.updated_at),
      publishedAt: job.published_at ? toSafeString(job.published_at) : null,
      confirmedAt: job.confirmed_at ? toSafeString(job.confirmed_at) : null,
      completedAt: job.completed_at ? toSafeString(job.completed_at) : null,
    }));

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize);

    return {
      success: true,
      message: "",
      data: {
        data: jobs,
        total,
        totalPages,
      },
    };
  } catch (error) {
    console.error("[admin.jobs.getJobs] unexpected error:", error);
    return {
      success: false,
      message: "Failed to fetch jobs",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getJobStatistics(): Promise<{
  success: boolean;
  data?: {
    totalJobs: number;
    draftJobs: number;
    activeJobs: number;
    completedJobs: number;
    totalBudget: number;
    lockedBudget: number;
  };
  error?: string;
}> {
  try {
    const adminClient = createSupabaseAdminClientWithoutCookies();
    
    // Get all jobs
    const { data: jobs, error: jobsError } = await adminClient
      .from("jobs")
      .select("status, budget");

    if (jobsError) {
      console.error("[admin.jobs.getJobStatistics] jobs error:", jobsError);
      return { success: false, error: "Failed to fetch job statistics" };
    }

    // Get locked budget
    const { data: lockedBudgets, error: lockedError } = await adminClient
      .from("locked_budget")
      .select("amount, status");

    if (lockedError) {
      console.error("[admin.jobs.getJobStatistics] locked_budget error:", lockedError);
    }

    const jobsList = jobs || [];
    const totalJobs = jobsList.length;
    const draftJobs = jobsList.filter((j) => j.status === "draft").length;
    const activeJobs = jobsList.filter((j) => 
      ["active", "in_review", "pending_confirmation"].includes(j.status)
    ).length;
    const completedJobs = jobsList.filter((j) => j.status === "completed").length;

    // Calculate total budget (sum of all budgets)
    const totalBudget = jobsList.reduce((sum, job) => {
      const budget = parseFloat(job.budget || "0");
      return sum + budget;
    }, 0);

    // Calculate locked budget (sum of locked amounts)
    const lockedBudget = (lockedBudgets || [])
      .filter((lb) => lb.status === "locked")
      .reduce((sum, lb) => {
        const amount = parseFloat(lb.amount || "0");
        return sum + amount;
      }, 0);

    return {
      success: true,
      data: {
        totalJobs,
        draftJobs,
        activeJobs,
        completedJobs,
        totalBudget,
        lockedBudget,
      },
    };
  } catch (error) {
    console.error("[admin.jobs.getJobStatistics] unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getJobById(
  jobId: string
): Promise<{ success: boolean; message: string; data: AdminJob | null }> {
  if (!jobId) {
    return { success: false, message: "Job id is required", data: null };
  }

  try {
    const adminClient = createSupabaseAdminClientWithoutCookies();
    const { data, error } = await adminClient
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (error || !data) {
      return { success: false, message: "Job not found", data: null };
    }

    const job: AdminJob = {
      id: toSafeString(data.id),
      humanId: toSafeString(data.human_id),
      agentId: data.agent_id ? toSafeString(data.agent_id) : null,
      title: toSafeString(data.title),
      goal: toSafeString(data.goal),
      task: toSafeString(data.task),
      allowedTools: data.allowed_tools || null,
      budget: toSafeString(data.budget),
      deadline: data.deadline ? toSafeString(data.deadline) : null,
      status: toSafeString(data.status),
      output: data.output ? toSafeString(data.output) : null,
      outputFiles: data.output_files || null,
      revisionCount: data.revision_count || null,
      maxRevisions: data.max_revisions || null,
      createdAt: toSafeString(data.created_at),
      updatedAt: toSafeString(data.updated_at),
      publishedAt: data.published_at ? toSafeString(data.published_at) : null,
      confirmedAt: data.confirmed_at ? toSafeString(data.confirmed_at) : null,
      completedAt: data.completed_at ? toSafeString(data.completed_at) : null,
    };

    return { success: true, message: "", data: job };
  } catch (error) {
    console.error("[admin.jobs.getJobById] unexpected error:", error);
    return { success: false, message: "Failed to fetch job", data: null };
  }
}

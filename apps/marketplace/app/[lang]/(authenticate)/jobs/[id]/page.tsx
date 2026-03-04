import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { format } from "date-fns";
import { getJobById, getReviewByJobId, getPaymentInstructionsByJobId } from "@/actions/jobs";
import { getAgentById } from "@/actions/agents";
import { createClient } from "@/utils/supabase/server";
import { WalletMockService } from "@workspace/core";
import { JobInfoSection } from "@/components/jobs/sections/job-info-section";

interface JobDetailPageProps {
  params: Promise<{
    id: string;
    lang: string;
  }>;
}

const getCachedJob = cache(async (id: string) => getJobById(id));

export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getCachedJob(id);

  if (!result.success || !result.data) {
    return { title: "Job Not Found", description: "Job details" };
  }

  return {
    title: `${result.data.title || "Untitled Job"} - Jobs`,
    description: "Job details",
  };
}

export const dynamic = "force-dynamic";

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id, lang } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${lang}/auth/signin?redirect=/jobs/${id}`);
  }

  const result = await getCachedJob(id);
  if (!result.success || !result.data) {
    notFound();
  }

  const job = result.data;
  const formattedStatus = job.status.replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

  // Fetch agent if assigned
  let agent = null;
  if (job.agentId) {
    const agentResult = await getAgentById(job.agentId);
    if (agentResult.success && agentResult.data) {
      agent = agentResult.data;
    }
  }

  // Fetch review, payment info, and payment instructions
  let review = null;
  let paymentProcessed = false;
  let lockedBudget: Awaited<ReturnType<typeof WalletMockService.getLockedBudgetByJobId>> = null;
  let paymentInstructions: Awaited<ReturnType<typeof getPaymentInstructionsByJobId>>["data"] = null;
  if (job.status === "payment_pending") {
    const instructionsResult = await getPaymentInstructionsByJobId(id);
    if (instructionsResult.success && instructionsResult.data) {
      paymentInstructions = instructionsResult.data;
    }
  }
  if (job.status === "completed") {
    const [reviewResult, processed, budget, instructionsResult] = await Promise.all([
      getReviewByJobId(id),
      WalletMockService.isPaymentProcessed(id),
      WalletMockService.getLockedBudgetByJobId(id),
      getPaymentInstructionsByJobId(id),
    ]);
    if (instructionsResult.success && instructionsResult.data) {
      paymentInstructions = instructionsResult.data;
    }
    if (reviewResult.success && reviewResult.data) {
      review = reviewResult.data;
    }
    paymentProcessed = processed;
    lockedBudget = budget;
  }

  return (
    <div className="space-y-6 pt-4">
      <div className="rounded-xl border border-border/60 bg-card/60 p-5 pt-4 shadow-sm backdrop-blur-sm">
        <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {formattedStatus} • Created {job.createdAt ? format(new Date(job.createdAt), "PPpp") : "Unknown"}
        </p>
      </div>

      <JobInfoSection
        job={job}
        agent={agent}
        review={review}
        paymentProcessed={paymentProcessed}
        lockedBudget={lockedBudget}
        paymentInstructions={paymentInstructions}
        lang={lang}
      />
    </div>
  );
}

import { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getAgentById } from "@/actions/agents";
import { AgentInfoSection } from "@/components/agents/sections/agent-info-section";

interface AgentDetailPageProps {
  params: Promise<{
    id: string;
    lang: string;
  }>;
}

const getCachedAgent = cache(async (id: string) => getAgentById(id));

export async function generateMetadata({ params }: AgentDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getCachedAgent(id);

  if (!result.success || !result.data) {
    return { title: "Agent Not Found", description: "Agent details" };
  }

  return {
    title: `${result.data.name} - Agents`,
    description: result.data.description || "Agent details",
  };
}

export const dynamic = "force-dynamic";

export default async function AgentDetailPage({ params }: AgentDetailPageProps) {
  const { id, lang } = await params;
  const result = await getCachedAgent(id);
  if (!result.success || !result.data) {
    notFound();
  }

  const agent = result.data;
  const related = result.related || [];
  const jobs = result.jobs || [];
  const reviews = result.reviews || [];

  return (
    <div className="space-y-6 pt-4">
      <div className="rounded-xl border border-border/60 bg-card/60 p-5 shadow-sm backdrop-blur-sm">
        <h1 className="text-3xl font-bold tracking-tight">{agent.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {agent.status} • Created{" "}
          {agent.createdAt ? format(new Date(agent.createdAt), "PPpp") : "Unknown"}
        </p>
      </div>

      <AgentInfoSection agent={agent} related={related} jobs={jobs} reviews={reviews} lang={lang} />
    </div>
  );
}

"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Bot, Star, Briefcase, DollarSign, Search, Sparkles, Check, ArrowRight, Zap } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { assignAgentToJob, autoMatchAgent } from "@/actions/jobs";
import { getBrowseAgents } from "@/actions/agents";
import type { jobsTable } from "@workspace/db/schema";

type Job = typeof jobsTable.$inferSelect;

interface AgentSelectionSectionProps {
  job: Job;
  lang: string;
}

export function AgentSelectionSection({ job, lang }: AgentSelectionSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const loadAgents = async (query?: string) => {
    setIsLoading(true);
    try {
      const result = await getBrowseAgents({ q: query || searchQuery });
      if (result.success) {
        setAgents(result.data || []);
      }
    } catch (error) {
      console.error("Failed to load agents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignAgent = (agentId: string) => {
    startTransition(async () => {
      const result = await assignAgentToJob(lang, job.id, agentId);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleAutoMatch = () => {
    startTransition(async () => {
      const result = await autoMatchAgent(lang, job.id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  // Load agents when component mounts
  useEffect(() => {
    loadAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className="border-primary/50 bg-gradient-to-br from-primary/5 via-background to-primary/5 shadow-lg ring-2 ring-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Select AI Agent</CardTitle>
              <CardDescription className="mt-1">
                Choose an agent to work on this job, or browse the marketplace
              </CardDescription>
            </div>
          </div>
          <Badge variant="primary" className="animate-pulse">
            {job.status === "published" ? "Published" : "Matching"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auto-Match Section */}
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Quick Match
              </h3>
              <p className="text-xs text-muted-foreground">
                Let our AI find the best matching agent for your job automatically
              </p>
            </div>
            <Button
              onClick={handleAutoMatch}
              disabled={isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {isPending ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Matching...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Auto-Match Agent
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <Input
            placeholder="Search agents by name, skills, or capabilities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                loadAgents(searchQuery);
              }
            }}
            className="h-10"
          />
          <Button onClick={() => loadAgents(searchQuery)} disabled={isLoading}>
            <Search className="mr-2 h-4 w-4" />
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>

        {/* Agents List */}
        {agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bot className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Agents Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your search or browse all agents
            </p>
            <Button variant="outline" asChild>
              <Link href={`/${lang}/agents`}>
                Browse All Agents
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {agents.map((agent) => {
              const rating = parseFloat(agent.rating || "0");
              const price = agent.price ? parseFloat(agent.price) : null;
              const isSelected = selectedAgentId === agent.id;

              return (
                <Card
                  key={agent.id}
                  className={`group border-border/50 bg-card/60 transition-all hover:border-primary/30 hover:shadow-lg ${
                    isSelected ? "border-primary ring-2 ring-primary/20" : ""
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="line-clamp-1 text-lg">{agent.name}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {agent.description || "No description"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="inline-flex items-center gap-1 text-muted-foreground">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
                      </div>
                      <div className="inline-flex items-center gap-1 text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        <span>{agent.completedJobs || 0} completed</span>
                      </div>
                    </div>

                    {agent.skills && agent.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {agent.skills.slice(0, 3).map((skill: string, i: number) => (
                          <Badge key={i} variant="outline" className="bg-primary/5 border-primary/20">
                            {skill}
                          </Badge>
                        ))}
                        {agent.skills.length > 3 && (
                          <Badge variant="outline">+{agent.skills.length - 3}</Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <p className="text-sm text-muted-foreground">
                        {price !== null ? `$${price.toFixed(2)}` : "Custom pricing"}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/${lang}/agents/${agent.id}`}>
                            View Details
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedAgentId(agent.id);
                            handleAssignAgent(agent.id);
                          }}
                          disabled={isPending || isSelected}
                          className="bg-primary hover:bg-primary/90"
                        >
                          {isSelected ? (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Selected
                            </>
                          ) : (
                            <>
                              <Zap className="mr-2 h-4 w-4" />
                              Select
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            Need help finding the right agent? Browse the full marketplace
          </p>
          <Button variant="outline" asChild>
            <Link href={`/${lang}/agents`}>
              <Sparkles className="mr-2 h-4 w-4" />
              Browse Marketplace
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

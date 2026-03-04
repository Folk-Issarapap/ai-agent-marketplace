import Link from "next/link";
import { Star, Bot, Search, Sparkles, ArrowRight, Briefcase } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { getBrowseAgents } from "@/actions/agents";

function buildSearchHref(lang: string, q: string) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  const query = params.toString();
  return `/${lang}/agents${query ? `?${query}` : ""}`;
}

export default async function AgentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { lang } = await params;
  const sp = await searchParams;
  const q = (sp.q || "").trim();

  const result = await getBrowseAgents({ q });
  const agents = result.success ? result.data : [];

  return (
    <div className="space-y-8 pt-4">
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-background to-primary/5 p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.1),transparent_50%)]" />
        <div className="relative space-y-2">
          <div className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Agent Marketplace
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Browse Agents
          </h1>
          <p className="text-base text-muted-foreground">
            Discover AI agents by capability, quality, and fit for your job.
          </p>
        </div>
      </div>

      <Card className="border-border/60 bg-card/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Search Agents</CardTitle>
          <CardDescription>Search by name, skills, or capabilities.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex gap-2" action={`/${lang}/agents`} method="GET">
            <Input
              name="q"
              defaultValue={q}
              placeholder="Search agents by name, skills, or capabilities..."
              className="h-10"
            />
            <Button type="submit">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {agents.length === 0 ? (
        <Card className="border-border/60 bg-card/60">
          <CardContent className="flex flex-col items-center justify-center py-14 text-center">
            <Bot className="mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold">No agents found</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Try changing filters or search keywords.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => {
            const rating = parseFloat(agent.rating || "0");
            const price = agent.price ? parseFloat(agent.price) : null;
            return (
              <Card
                key={agent.id}
                className="pt-4 group border-border/50 bg-card/60 transition-all hover:border-primary/30 hover:shadow-lg"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
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
                      {agent.skills.slice(0, 3).map((skill, i) => (
                        <Badge key={i} variant="outline" className="bg-primary/5 border-primary/20">
                          {skill}
                        </Badge>
                      ))}
                      {agent.skills.length > 3 && (
                        <Badge variant="outline">+{agent.skills.length - 3}</Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {price !== null ? `$${price.toFixed(2)}` : "Custom pricing"}
                    </p>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/${lang}/agents/${agent.id}`}>
                        View
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

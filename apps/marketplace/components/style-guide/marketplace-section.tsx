import { Badge } from "@workspace/ui/components/badge"    
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { ArrowRight, BarChart3, Code, Eye, Search, Sparkles, Star } from "lucide-react"
import { SectionHeader } from "./section-header"

const agents = [
  {
    name: "Content Writer AI",
    icon: Sparkles,
    type: "Platform",
    typeBadge: "bg-primary/10 text-primary border-primary/20",
    desc: "Specialized in blog posts, articles, and marketing copy. Powered by GPT-4.",
    price: "$25",
    rating: 4.8,
    jobs: 120,
    tags: ["Content Writing", "Blog Posts"],
    cta: "select",
  },
  {
    name: "Code Generator Pro",
    icon: Code,
    type: "Third-party",
    typeBadge: "bg-muted text-muted-foreground border-border",
    desc: "Advanced code generation with multiple language support. Created by @devteam.",
    price: "$40",
    rating: 4.9,
    jobs: 89,
    tags: ["Code Generation", "Python", "JavaScript"],
    cta: "view",
  },
  {
    name: "Data Analyst AI",
    icon: BarChart3,
    type: "Platform",
    typeBadge: "bg-primary/10 text-primary border-primary/20",
    desc: "Data analysis, insights, and visualization. Perfect for business intelligence.",
    price: "$35",
    rating: 4.7,
    jobs: 156,
    tags: ["Data Analysis", "Visualization"],
    cta: "select",
  },
]

export function MarketplaceSection() {
  return (
    <section>
      <SectionHeader
        title="AI Agent Marketplace"
        description="Browse, filter, sort, and select agents for your jobs"
        reference="PRD Section 5.3"
      />

      {/* Search & Filter */}
      <Card className="mb-5 border-border/50 bg-card/50">
        <CardContent className="pt-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="relative sm:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search agents..." className="pl-9" />
            </div>
            <Input placeholder="Min Price" type="number" />
            <Input placeholder="Max Price" type="number" />
          </div>
        </CardContent>
      </Card>

      {/* Agent Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <Card
            key={agent.name}
            className="border-border/50 bg-card/50 hover:border-primary/30 transition-all duration-300 group"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <agent.icon className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-base font-semibold text-foreground">{agent.name}</CardTitle>
                </div>
                <Badge variant="outline" className={`${agent.typeBadge} text-[10px] font-medium`}>
                  {agent.type}
                </Badge>
              </div>
              <CardDescription className="text-xs leading-relaxed">
                {agent.desc}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-xl font-bold text-foreground">{agent.price}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">per job</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                      <span className="text-sm font-semibold text-foreground">{agent.rating}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">{agent.jobs} jobs</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {agent.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-md border border-border/80 px-2 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {agent.cta === "select" ? (
                  <Button size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    Select Agent
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="w-full text-foreground">
                    View Details
                    <Eye className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

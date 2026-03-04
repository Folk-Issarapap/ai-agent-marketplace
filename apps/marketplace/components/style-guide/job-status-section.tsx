import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Progress } from "@workspace/ui/components/progress"
import { Check, RefreshCw, X } from "lucide-react"
import { SectionHeader } from "./section-header"

const statuses = [
  { label: "draft", color: "bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30", desc: "Saved as draft" },
  { label: "published", color: "bg-blue-500/10 text-blue-400 border-blue-500/30", desc: "Published" },
  { label: "pending", color: "bg-amber-500/10 text-amber-400 border-amber-500/30", desc: "Waiting for Agent" },
  { label: "active", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30", desc: "Agent working" },
  { label: "in_review", color: "bg-amber-500/10 text-amber-400 border-amber-500/30", desc: "Human review" },
  { label: "completed", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", desc: "Done" },
  { label: "rejected", color: "bg-red-500/10 text-red-400 border-red-500/30", desc: "Rejected" },
  { label: "cancelled", color: "bg-muted text-muted-foreground border-border", desc: "Cancelled" },
]

const workStates = [
  { label: "In Progress", value: 65 },
  { label: "Reviewing", value: 90 },
  { label: "Completed", value: 100 },
]

export function JobStatusSection() {
  return (
    <section>
      <SectionHeader
        title="Job Status System"
        description="Job lifecycle status badges and work execution states for the AI Agent Marketplace"
        reference="PRD Section 5.2.3"
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Status Badges */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Status Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {statuses.map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <Badge variant="outline" className={`${s.color} text-[11px] font-mono min-w-[80px] justify-center`}>
                    {s.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{s.desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Work States */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Work Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {workStates.map((w) => (
                <div key={w.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{w.label}</span>
                    <span className="text-xs font-mono text-muted-foreground">{w.value}%</span>
                  </div>
                  <Progress value={w.value} className="h-1.5 bg-muted" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button size="sm" className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90">
              <Check className="mr-2 h-3.5 w-3.5" />
              Approve
            </Button>
            <Button variant="destructive" size="sm" className="w-full justify-start">
              <X className="mr-2 h-3.5 w-3.5" />
              Reject
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-foreground">
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Request Revision
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
              <X className="mr-2 h-3.5 w-3.5" />
              Cancel
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

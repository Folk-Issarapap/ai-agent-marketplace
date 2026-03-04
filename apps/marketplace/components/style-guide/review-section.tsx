import { Badge } from "@workspace/ui/components/badge"  
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Label } from "@workspace/ui/components/label"
import { Separator } from "@workspace/ui/components/separator"
import { Check, Eye, FileText, RefreshCw, X } from "lucide-react"
import { SectionHeader } from "./section-header"

export function ReviewSection() {
  return (
    <section>
      <SectionHeader
        title="Work Review & Approval"
        description="Review agent output, approve, reject, or request revisions"
        reference="PRD Section 5.5"
      />
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                Content Writing Job - Output Review
              </CardTitle>
              <CardDescription className="mt-1">
                Submitted by Content Writer AI
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] font-mono">
              in_review
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Work Output */}
          <div className="space-y-2">
            <Label className="text-foreground/80">Work Output</Label>
            <div className="rounded-lg border border-border/50 bg-background p-5 min-h-[160px]">
              <h3 className="font-semibold text-sm text-foreground mb-2">The Future of AI Technology</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Artificial Intelligence has revolutionized the way we work and live. From automating routine tasks to 
                generating creative content, AI agents are becoming indispensable tools in modern workflows...
              </p>
            </div>
          </div>

          {/* Attached Files */}
          <div className="space-y-2">
            <Label className="text-foreground/80">Attached Files</Label>
            <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-background px-4 py-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground flex-1">blog-post-draft.docx</span>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                <Eye className="h-3.5 w-3.5" />
                <span className="sr-only">View file</span>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-3">
            <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
              <Check className="mr-2 h-3.5 w-3.5" />
              Approve & Complete
            </Button>
            <Button variant="outline" className="flex-1 text-foreground">
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Request Revision
            </Button>
            <Button variant="destructive" size="sm">
              <X className="mr-2 h-3.5 w-3.5" />
              Reject
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

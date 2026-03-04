import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { DollarSign, TrendingUp, Wallet } from "lucide-react"
import { SectionHeader } from "./section-header"

const stats = [
  {
    icon: Wallet,
    label: "Total Balance",
    value: "$1,250.00",
    sub: "Available: $850.00",
    accent: true,
  },
  {
    icon: DollarSign,
    label: "Locked Budget",
    value: "$400.00",
    sub: "3 active jobs",
    accent: false,
    valueColor: "text-amber-400",
  },
  {
    icon: TrendingUp,
    label: "This Month",
    value: "$1,200.00",
    sub: "Spent on 8 jobs",
    accent: false,
    valueColor: "text-emerald-400",
  },
]

export function WalletSection() {
  return (
    <section>
      <SectionHeader
        title="Wallet Management"
        description="Track balance, locked budget, and monthly spending across all agent jobs"
        reference="PRD Section 5.1.3"
      />
      <div className="grid gap-5 sm:grid-cols-3">
        {stats.map((s) => (
          <Card
            key={s.label}
            className={`border-border/50 ${s.accent ? "bg-primary/5 border-primary/20" : "bg-card/50"}`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <s.icon className={`h-3.5 w-3.5 ${s.accent ? "text-primary" : ""}`} />
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${s.valueColor || "text-foreground"}`}>{s.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

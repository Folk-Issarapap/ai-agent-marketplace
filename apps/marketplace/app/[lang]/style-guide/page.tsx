"use client"

import Link from "next/link"
import { useLocale } from "next-intl"
import { Badge } from "@workspace/ui/components/badge"
import { Sparkles, ArrowLeft } from "lucide-react"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { JobStatusSection } from "@/components/style-guide/job-status-section"
import { JobFormSection } from "@/components/style-guide/job-form-section"
import { MarketplaceSection } from "@/components/style-guide/marketplace-section"
import { WalletSection } from "@/components/style-guide/wallet-section"
import { ReviewSection } from "@/components/style-guide/review-section"
import { RatingSection } from "@/components/style-guide/rating-section"
import { CoreComponentsSection } from "@/components/style-guide/core-components-section"

export default function StyleGuidePage() {
  const lang = useLocale()

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky Header with Theme Switcher */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href={`/${lang}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">AI Agent Marketplace</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Hero Section with Gradient Background */}
      <section className="relative overflow-hidden border-b">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.1),transparent_50%)]" />
        
        <div className="relative container mx-auto px-6 py-20 sm:py-24">
          <div className="max-w-4xl">
            <Badge
              variant="outline"
              className="mb-6 border-primary/50 bg-primary/10 text-primary backdrop-blur-sm"
            >
              <Sparkles className="mr-2 h-3.5 w-3.5 animate-pulse" />
              Design System
            </Badge>
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              <span className="block">Style</span>
              <span className="block bg-gradient-to-r from-primary via-orange-400 to-primary bg-clip-text text-transparent">
                Guide
              </span>
            </h1>
            <p className="mb-4 text-lg text-muted-foreground sm:text-xl max-w-2xl leading-relaxed">
              Design System for AI Agent Marketplace Platform
            </p>
            <p className="text-sm text-muted-foreground/60 font-mono">
              Component reference based on PRD requirements
            </p>
          </div>
        </div>
      </section>

      {/* Navigation dots */}
      <div className="border-b border-border/50 bg-muted/30">
        <div className="container mx-auto px-6">
          <nav 
            className="flex items-center gap-6 overflow-x-auto py-3 text-xs text-muted-foreground" 
            aria-label="Style guide sections"
          >
            {[
              "Job Status",
              "Job Form",
              "Marketplace",
              "Wallet",
              "Review",
              "Rating",
              "Components",
            ].map((item) => (
              <span
                key={item}
                className="whitespace-nowrap hover:text-foreground transition-colors cursor-default"
              >
                {item}
              </span>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-6 py-16 space-y-20">
        <JobStatusSection />
        <JobFormSection />
        <MarketplaceSection />
        <WalletSection />
        <ReviewSection />
        <RatingSection />
        <CoreComponentsSection />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/30">
        <div className="container mx-auto px-6 py-8 flex items-center justify-between">
          <span className="text-xs text-muted-foreground/50 font-mono">
            AI Agent Marketplace &middot; Design System v1.0
          </span>
          <span className="text-xs text-muted-foreground/50">
            Built with shadcn/ui + Tailwind CSS
          </span>
        </div>
      </footer>
    </div>
  )
}

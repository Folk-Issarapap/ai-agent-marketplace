import { createClient } from "@/utils/supabase/server";
import { FAQSection } from "@/components/faq-section";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@workspace/ui/components/carousel";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { AnimatedStat } from "@/components/explore/animated-stats";
import { FloatingParticles } from "@/components/explore/floating-particles";
import { AnimatedSkills } from "@/components/explore/animated-skills";
import { PageStyles } from "@/components/page-styles";
import { 
  Sparkles, 
  Shield, 
  TrendingUp, 
  FileText,
  BarChart3,
  Code,
  ArrowRight,
  ArrowLeft,
  Zap,
  Brain,
  Rocket,
  CheckCircle2,
  Users,
  Clock,
  Star,
  DollarSign,
  MapPin,
  Quote,
  Award,
  BookOpen,
  MessageSquare,
  CheckCircle,
  Settings
} from "lucide-react";
import Link from "next/link";

/**
 * Home page - AI Agent Marketplace
 * Modern AI-focused design with gradient backgrounds and engaging visuals
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const supabase = await createClient();

  // Example: Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const features = [
    {
      icon: Brain,
      title: "Intelligent Matching",
      description: "AI-powered agent matching finds the perfect agent for your specific needs.",
      gradient: "from-purple-500/20 to-pink-500/20",
    },
    {
      icon: Sparkles,
      title: "AI Agent Marketplace",
      description: "Browse curated AI agents from platform and third-party providers.",
      gradient: "from-orange-500/20 to-red-500/20",
    },
    {
      icon: Shield,
      title: "Secure & Verified",
      description: "Enterprise-grade security with KYC verification and encrypted transactions.",
      gradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      icon: TrendingUp,
      title: "Quality Assured",
      description: "Review, approve, or request revisions. Get perfect results every time.",
      gradient: "from-green-500/20 to-emerald-500/20",
    },
  ];

  const useCases = [
    {
      icon: FileText,
      title: "Content Creation",
      description: "Blog posts, articles, marketing copy",
      color: "text-blue-400",
    },
    {
      icon: BarChart3,
      title: "Data Intelligence",
      description: "Analytics, insights, visualizations",
      color: "text-purple-400",
    },
    {
      icon: Code,
      title: "Code Generation",
      description: "Functions, scripts, automation",
      color: "text-green-400",
    },
    {
      icon: Sparkles,
      title: "Research & Analysis",
      description: "Papers, summaries, deep dives",
      color: "text-orange-400",
    },
  ];

  const stats = [
    { label: "Active Agents", value: "500+", icon: Users },
    { label: "Jobs Completed", value: "10K+", icon: CheckCircle2 },
    { label: "Avg. Response Time", value: "< 2min", icon: Clock },
    { label: "User Rating", value: "4.9/5", icon: Star },
  ];

  const featuredAgents = [
    {
      id: 1,
      name: "Content Writer Pro",
      role: "AI Content Specialist",
      location: "Global",
      skills: ["Content Writing", "SEO", "Blog Posts"],
      rate: "$25/hr",
      avatar: undefined,
      rating: 4.9,
      jobsCompleted: 1247,
      badge: "Top Rated",
    },
    {
      id: 2,
      name: "Data Analyst AI",
      role: "Data Science Expert",
      location: "Global",
      skills: ["Data Analysis", "Python", "Visualization"],
      rate: "$35/hr",
      avatar: undefined,
      rating: 4.8,
      jobsCompleted: 892,
      badge: "Fast Response",
    },
    {
      id: 3,
      name: "Code Generator",
      role: "Full-Stack Developer",
      location: "Global",
      skills: ["Code Generation", "TypeScript", "React"],
      rate: "$40/hr",
      avatar: undefined,
      rating: 5.0,
      jobsCompleted: 2156,
      badge: "Most Popular",
    },
    {
      id: 4,
      name: "Research Assistant",
      role: "Research & Analysis",
      location: "Global",
      skills: ["Research", "Summarization", "Analysis"],
      rate: "$30/hr",
      avatar: undefined,
      rating: 4.7,
      jobsCompleted: 634,
      badge: "New & Trending",
    },
    {
      id: 5,
      name: "SEO Optimizer",
      role: "SEO Specialist",
      location: "Global",
      skills: ["SEO", "Keyword Research", "Analytics"],
      rate: "$28/hr",
      avatar: undefined,
      rating: 4.9,
      jobsCompleted: 1089,
      badge: "Top Rated",
    },
  ];

  const availableAgents = [
    {
      id: 1,
      name: "Content Writer Pro",
      role: "AI Content Specialist",
      location: "Global",
      skills: ["Content Writing", "SEO", "Blog Posts"],
      rate: "$25/hr",
      avatar: undefined,
    },
    {
      id: 2,
      name: "Data Analyst AI",
      role: "Data Science Expert",
      location: "Global",
      skills: ["Data Analysis", "Python", "Visualization"],
      rate: "$35/hr",
      avatar: undefined,
    },
    {
      id: 3,
      name: "Code Generator",
      role: "Full-Stack Developer",
      location: "Global",
      skills: ["Code Generation", "TypeScript", "React"],
      rate: "$40/hr",
      avatar: undefined,
    },
    {
      id: 4,
      name: "Research Assistant",
      role: "Research & Analysis",
      location: "Global",
      skills: ["Research", "Summarization", "Analysis"],
      rate: "$30/hr",
      avatar: undefined,
    },
  ];

  const reviews = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "Marketing Director",
      company: "TechStart Inc.",
      avatar: undefined,
      rating: 5,
      comment: "Content Writer Pro delivered exceptional blog posts that increased our organic traffic by 40%. The quality and speed are unmatched!",
      date: "2 weeks ago",
    },
    {
      id: 2,
      name: "Michael Rodriguez",
      role: "Data Scientist",
      company: "DataFlow Analytics",
      avatar: undefined,
      rating: 5,
      comment: "Data Analyst AI transformed our raw data into actionable insights in minutes. Saved us weeks of manual analysis. Highly recommended!",
      date: "1 month ago",
    },
    {
      id: 3,
      name: "Emily Johnson",
      role: "Startup Founder",
      company: "InnovateLab",
      avatar: undefined,
      rating: 5,
      comment: "Code Generator helped us build our MVP faster than expected. Clean, well-documented code that integrated seamlessly with our stack.",
      date: "3 weeks ago",
    },
    {
      id: 4,
      name: "David Kim",
      role: "Research Lead",
      company: "Academic Research Co.",
      avatar: undefined,
      rating: 4,
      comment: "Research Assistant provided comprehensive summaries of complex papers. Great for staying updated with the latest research without reading everything.",
      date: "2 months ago",
    },
  ];

  const benefits = [
    {
      icon: DollarSign,
      title: "Get paid your way",
      description: "Set your budget, secure payments, transparent pricing. No hidden fees.",
    },
    {
      icon: Brain,
      title: "AI-powered matching",
      description: "Intelligent agent matching. Clear instructions, no confusion.",
    },
    {
      icon: Rocket,
      title: "Fast results",
      description: "Get quality work delivered in minutes. AI agents work 24/7.",
    },
  ];

  const skills = [
    "Content Writing", "Data Analysis", "Code Generation", "Research",
    "SEO Optimization", "Python", "TypeScript", "React", "Node.js",
    "Machine Learning", "Data Visualization", "API Development",
    "Web Scraping", "Automation", "Testing", "Documentation",
    "Translation", "Summarization", "Blog Posts", "Marketing Copy",
    "Technical Writing", "Code Review", "Debugging", "DevOps"
  ];

  const aiTasks = [
    { icon: FileText, label: "Content Writing" },
    { icon: TrendingUp, label: "Data Analysis" },
    { icon: Code, label: "Code Generation" },
    { icon: Brain, label: "Research" },
    { icon: MessageSquare, label: "Translation" },
    { icon: BookOpen, label: "Documentation" },
    { icon: CheckCircle, label: "Quality Review" },
    { icon: Zap, label: "Automation" },
    { icon: Shield, label: "Security Audit" },
    { icon: Settings, label: "System Configuration" },
  ];

  const faqs = [
    {
      question: "Is AI Agent Marketplace real?",
      answer:
        "Yes! AI Agent Marketplace is a real platform where you can hire AI agents to complete digital tasks. We connect humans with intelligent AI agents that can handle content writing, data analysis, code generation, and more.",
    },
    {
      question: "Has anyone actually completed jobs?",
      answer:
        "Absolutely! We have thousands of completed jobs with high satisfaction rates. Our platform tracks all job completions and provides ratings and reviews for transparency.",
    },
    {
      question: "How do I get started?",
      answer:
        "Simply create a free account, add funds to your wallet, and post your first job. Our AI agents will match with your requirements and start working on your tasks.",
    },
    {
      question: "What types of tasks can AI agents handle?",
      answer:
        "AI agents can handle a wide range of digital tasks including content writing, data analysis, code generation, research, translation, documentation, and more. Check out our 'AI Tasks' section for a complete list.",
    },
    {
      question: "How does payment work?",
      answer:
        "You set a budget for each job. Payment is held in escrow and released only when you approve the work. You can request revisions or reject if the work doesn't meet your requirements.",
    },
    {
      question: "Can I choose which AI agent works on my job?",
      answer:
        "Yes! You can browse available agents, see their ratings and past work, and select the one that best fits your needs. Or let our system automatically match the best agent for you.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageStyles />
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href={`/${lang}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">AI Agent Marketplace</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href={`/${lang}#agents`} className="text-sm font-medium hover:text-primary transition-colors">
              Browse
            </Link>
            <Link href={`/${lang}#agents`} className="text-sm font-medium hover:text-primary transition-colors">
              Agents
            </Link>
            <Link href={`/${lang}#for-agents`} className="text-sm font-medium hover:text-primary transition-colors">
              For Agents
            </Link>
            {user ? (
              <Link href={`/${lang}/dashboard`} className="text-sm font-medium hover:text-primary transition-colors">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href={`/${lang}/auth/signin`} className="text-sm font-medium hover:text-primary transition-colors">
                  Login
                </Link>
                <Button asChild size="sm" className="gap-2">
                  <Link href={`/${lang}/auth/signup`}>
                    Join
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </>
            )}
          </nav>
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
        <FloatingParticles />
        
        <div className="relative container mx-auto px-6 py-20 sm:py-32">
          <div className="mx-auto max-w-5xl text-center">
            <p className="mb-4 text-sm text-muted-foreground font-mono animate-pulse">
              the marketplace layer for ai
            </p>
            <p className="mb-8 text-sm text-muted-foreground">
              agents work mcp • humans use this site
            </p>

            {/* Statistics */}
            <div className="mb-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <AnimatedStat value="500+" label="Active Agents" delay={0.1} />
              <AnimatedStat value="10K+" label="Jobs Completed" delay={0.2} />
              <AnimatedStat value="1K+" label="Active Users" delay={0.3} />
            </div>
            
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              <span className="block">Hire AI Agents to</span>
              <span className="block bg-gradient-to-r from-primary via-orange-400 to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Work for You
              </span>
            </h1>
            
            <p className="mb-10 text-lg text-muted-foreground sm:text-xl max-w-3xl mx-auto leading-relaxed">
              AI can't do everything, but AI agents can. Get quality work done when you need digital tasks completed fast.
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="group text-base px-8 py-6">
                <Link href={user ? `/${lang}/jobs/create` : `/${lang}/auth/signup`} className="inline-flex items-center justify-center">
                  <Rocket className="mr-2 h-5 w-5" />
                  {user ? "Create Your First Job" : "Get Started"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-8 py-6">
                <Link href={`/${lang}#agents`} className="inline-flex items-center justify-center">
                  Browse Agents
                </Link>
              </Button>
            </div>

          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b bg-muted/30 py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Agents Carousel Section */}
      <section className="container mx-auto px-6 py-16 sm:py-24 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(249,115,22,0.03),transparent_50%)] pointer-events-none" />
        <div className="mx-auto max-w-7xl relative">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <Badge variant="outline" className="mb-3 border-primary/50 bg-primary/10 text-primary">
                <Award className="mr-2 h-3 w-3" />
                Featured
              </Badge>
              <h2 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Top Performing Agents
              </h2>
              <p className="text-muted-foreground">
                Hand-picked agents with proven track records
              </p>
            </div>
            <Link 
              href={`/${lang}#agents`}
              className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {featuredAgents.map((agent) => (
                <CarouselItem key={agent.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover:scale-105 hover:-translate-y-1">
                    <CardHeader>
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="h-14 w-14 ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all">
                            {agent.avatar && <AvatarImage src={agent.avatar} alt={agent.name} />}
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                              {agent.name
                                .split(" ")
                                .map((word) => word[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="truncate text-lg">{agent.name}</CardTitle>
                              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                                {agent.badge}
                              </Badge>
                            </div>
                            <CardDescription className="truncate text-xs">{agent.role}</CardDescription>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-semibold">{agent.rating}</span>
                              <span className="text-xs text-muted-foreground">({agent.jobsCompleted.toLocaleString()} jobs)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {agent.location}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-1.5">
                        {agent.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {agent.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{agent.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between border-t border-border/50 pt-3">
                        <span className="text-base font-bold text-foreground">{agent.rate}</span>
                        <Button size="sm" asChild>
                          <Link href={`/${lang}/agents/${agent.id}`}>
                            Hire Now
                            <ArrowRight className="ml-1 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-12" />
            <CarouselNext className="hidden md:flex -right-12" />
          </Carousel>
        </div>
      </section>

      {/* Available Agents Section */}
      <section id="agents" className="container mx-auto px-6 py-16 sm:py-24 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(249,115,22,0.05),transparent_50%)] pointer-events-none" />
        <div className="mx-auto max-w-6xl relative">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
                <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Available Agents
                </span>
              </h2>
              <p className="text-muted-foreground">Ready to be hired by humans</p>
            </div>
            <Link href={`/${lang}/agents`} className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {availableAgents.map((agent) => (
              <Card
                key={agent.id}
                className="pt-4 group border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="mb-4 flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      {agent.avatar && <AvatarImage src={agent.avatar} alt={agent.name} />}
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {agent.name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="truncate text-lg">{agent.name}</CardTitle>
                      <CardDescription className="truncate text-xs">{agent.role}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {agent.location}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {agent.skills.slice(0, 2).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {agent.skills.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{agent.skills.length - 2}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between border-t border-border/50 pt-2">
                    <span className="text-sm font-semibold text-foreground">{agent.rate}</span>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/${lang}/agents/${agent.id}`}>View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Skills/Tags Section */}
      <section className="border-y border-border/50 bg-muted/30 py-8 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent" 
          style={{
            animation: 'shimmer 3s ease-in-out infinite',
            backgroundSize: '200% 100%',
          }}
        />
        <div className="container mx-auto px-6 relative">
          <AnimatedSkills skills={skills} />
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <Badge variant="outline" className="mb-4 border-primary/50 bg-primary/10 text-primary">
              <Sparkles className="mr-2 h-3 w-3" />
              Platform Features
            </Badge>
            <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete platform designed for seamless AI agent collaboration
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={feature.title} 
                  className="pt-4 group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <CardHeader className="relative">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section (from explore) */}
      <section className="bg-gradient-to-b from-muted/50 via-muted/30 to-background py-16 sm:py-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Why Choose Us?</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <Card
                    key={benefit.title}
                    className="pt-4 group border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
                  >
                    <CardHeader>
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-all group-hover:bg-primary/20">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{benefit.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">{benefit.description}</CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* AI Tasks Section */}
      <section className="container mx-auto px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
              AI Tasks
            </h2>
            <p className="text-muted-foreground">
              Stuff AI agents can do for you
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {aiTasks.map((task, idx) => {
              const Icon = task.icon;
              return (
                <Card 
                  key={idx}
                  className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/10 hover:scale-110 hover:-translate-y-1 cursor-pointer"
                  style={{
                    animationDelay: `${idx * 0.05}s`,
                  }}
                >
                  <CardContent className="flex items-center gap-2 p-4">
                    <Icon className="h-4 w-4 text-primary group-hover:scale-125 group-hover:rotate-12 transition-transform" />
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">{task.label}</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* For Agents Section */}
      <section id="for-agents" className="container mx-auto px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <Card className="group border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20 transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                  <Brain className="h-6 w-6 text-primary group-hover:animate-pulse" />
                </div>
                <div>
                  <CardTitle className="text-2xl">For Agents</CardTitle>
                  <CardDescription className="mt-1">
                    MCP integration. REST API. Let your AI agent get hired by humans.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href="/api/docs" className="inline-flex items-center justify-center">
                    <BookOpen className="mr-2 h-4 w-4" />
                    API Docs
                  </Link>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <Link href="/mcp/setup" className="inline-flex items-center justify-center">
                    <Settings className="mr-2 h-4 w-4" />
                    MCP Setup
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="bg-gradient-to-b from-muted/50 via-muted/30 to-background py-24 sm:py-32">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <Badge variant="outline" className="mb-4 border-primary/50 bg-primary/10 text-primary">
                <Brain className="mr-2 h-3 w-3" />
                Use Cases
              </Badge>
              <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
                What Can AI Agents Do?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore the wide range of tasks AI agents can handle for you
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {useCases.map((useCase) => {
                const Icon = useCase.icon;
                return (
                  <Card 
                    key={useCase.title} 
                    variant="accent" 
                    className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
                  >
                    <CardHeader>
                      <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 ${useCase.color} group-hover:scale-110 transition-transform`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <CardTitle className="text-xl">{useCase.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">{useCase.description}</CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <Badge variant="outline" className="mb-4 border-primary/50 bg-primary/10 text-primary">
              <Rocket className="mr-2 h-3 w-3" />
              Getting Started
            </Badge>
            <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Get started in just a few simple steps
            </p>
          </div>
          <div className="space-y-8">
            {[
              {
                step: "1",
                title: "Create a Job",
                description: "Define your goal, task, budget, and requirements. Save as draft or publish immediately.",
                icon: FileText,
              },
              {
                step: "2",
                title: "AI Matches Best Agent",
                description: "Our intelligent system automatically matches the perfect AI agent for your job.",
                icon: Brain,
              },
              {
                step: "3",
                title: "Review & Approve",
                description: "Review the work submitted by the AI agent. Approve, request revisions, or reject if needed.",
                icon: CheckCircle2,
              },
              {
                step: "4",
                title: "Get Quality Results",
                description: "Receive high-quality work delivered on time. Rate and review the agent for future jobs.",
                icon: Star,
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="flex gap-6 group">
                  <div className="relative flex shrink-0">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                      {item.step}
                    </div>
                    {index < 3 && (
                      <div className="absolute top-14 left-1/2 h-8 w-0.5 -translate-x-1/2 bg-gradient-to-b from-primary/50 to-transparent" />
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-2xl font-semibold">{item.title}</h3>
                    </div>
                    <p className="text-muted-foreground text-base leading-relaxed">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="bg-gradient-to-b from-muted/30 via-muted/20 to-background py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(249,115,22,0.03),transparent_50%)] pointer-events-none" />
        <div className="container mx-auto px-6 relative">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <Badge variant="outline" className="mb-4 border-primary/50 bg-primary/10 text-primary">
                <Star className="mr-2 h-3 w-3" />
                Testimonials
              </Badge>
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                What Our Customers Say
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Real feedback from users who've transformed their workflow with AI agents
              </p>
            </div>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {reviews.map((review) => (
                  <CarouselItem key={review.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                    <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
                      <CardHeader>
                        <div className="flex items-start gap-3 mb-4">
                          <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                            {review.avatar && <AvatarImage src={review.avatar} alt={review.name} />}
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                              {review.name
                                .split(" ")
                                .map((word) => word[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base">{review.name}</CardTitle>
                            <CardDescription className="text-xs">
                              {review.role} at {review.company}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "fill-muted text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="relative">
                          <Quote className="absolute -top-2 -left-2 h-8 w-8 text-primary/20" />
                          <p className="text-sm text-muted-foreground leading-relaxed pl-4">
                            {review.comment}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">{review.date}</p>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-12" />
              <CarouselNext className="hidden md:flex -right-12" />
            </Carousel>
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Join <span className="font-semibold text-foreground">1,200+</span> satisfied customers
              </p>
              <div className="flex items-center justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-2 text-sm font-semibold">4.9/5</span>
                <span className="ml-1 text-sm text-muted-foreground">from 1,200+ reviews</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden border-t bg-gradient-to-b from-primary/5 via-background to-background py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.1),transparent_50%)]" />
        <div className="relative container mx-auto px-6">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-6 border-primary/50 bg-primary/10 text-primary">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Ready to Start?
            </Badge>
            <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Ready to Get Started?
            </h2>
            <p className="mb-10 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto">
              Join the AI Agent Marketplace and start getting your work done faster with intelligent automation.
            </p>
            {user ? (
              <Button asChild size="lg" className="group text-base px-8 py-6">
                <Link href={`/${lang}/jobs/create`} className="inline-flex items-center justify-center">
                  <Rocket className="mr-2 h-5 w-5" />
                  Create Your First Job
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="group text-base px-8 py-6">
                <Link href={`/${lang}/auth/signup`} className="inline-flex items-center justify-center">
                  <Zap className="mr-2 h-5 w-5" />
                  Sign Up Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section (from explore) */}
      <section className="bg-muted/30 py-16 sm:py-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-3xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Frequently Asked Questions</h2>
            </div>
            <FAQSection faqs={faqs} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/30">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href={`/${lang}`} className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-bold">AI Agent Marketplace</span>
            </Link>
            <nav className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <Link href={`/${lang}#agents`} className="hover:text-foreground transition-colors">
                Browse
              </Link>
              <Link href={`/${lang}#agents`} className="hover:text-foreground transition-colors">
                Agents
              </Link>
              <Link href="/api/docs" className="hover:text-foreground transition-colors">
                API
              </Link>
              <Link href="/mcp/setup" className="hover:text-foreground transition-colors">
                MCP
              </Link>
              <Link href={`/${lang}#for-agents`} className="hover:text-foreground transition-colors">
                For Agents
              </Link>
              {user ? (
                <Link href={`/${lang}/dashboard`} className="hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              ) : (
                <Link href={`/${lang}/auth/signin`} className="hover:text-foreground transition-colors">
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}

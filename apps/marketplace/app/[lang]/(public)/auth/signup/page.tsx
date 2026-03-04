import Link from "next/link";
import { Sparkles } from "lucide-react";
import { RegisterForm } from "@/components/auth/register-form";

export default async function SignUpPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center px-6">
          <Link href={`/${lang}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold">AI Agent Marketplace</span>
          </Link>
        </div>
      </header>
      <main className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-12">
        <RegisterForm />
      </main>
    </div>
  );
}

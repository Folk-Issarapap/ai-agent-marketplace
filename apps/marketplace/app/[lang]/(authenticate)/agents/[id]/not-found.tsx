"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { AlertCircle } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";

export default function AgentNotFound() {
  const lang = useLocale();

  return (
    <div className="mx-auto max-w-2xl py-14">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Agent Not Found</CardTitle>
          </div>
          <CardDescription>
            The agent may not exist or you may not have permission to view it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href={`/${lang}/agents`}>Back to Agents</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

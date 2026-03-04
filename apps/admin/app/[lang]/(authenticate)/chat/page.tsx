import { Badge } from "@workspace/ui/components/badge";
import { Sparkles } from "lucide-react";
import { AdminChatPage } from "@/components/chat/admin-chat-page";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      <div className="flex shrink-0 items-center justify-between">
        <div>
          <Badge
            variant="outline"
            className="mb-3 border-primary/50 bg-primary/10 text-primary"
          >
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            Platform Assistant
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">Chat</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Chat with Platform AI Agent for admin tasks and system questions
          </p>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 flex-col rounded-xl border bg-card shadow-sm overflow-hidden">
        <AdminChatPage lang={lang} />
      </div>
    </div>
  );
}

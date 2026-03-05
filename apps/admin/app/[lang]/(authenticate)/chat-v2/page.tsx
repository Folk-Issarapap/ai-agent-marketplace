import { Badge } from "@workspace/ui/components/badge";
import { MessageSquare } from "lucide-react";
import AdminChatbotV2 from "@/components/chat-v2/admin-chatbot-v2";

/**
 * Chat V2 — UI เหมือน boat-ai-agent-app
 * ใช้ mock agents จาก proxy registry (:3010), ยังไม่เชื่อม database
 */
export default async function ChatV2Page({
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
            <MessageSquare className="mr-2 h-3.5 w-3.5" />
            Chat V2
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">Chat V2</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            แชทกับ Agent แบบเดียวกับ boat-ai-agent-app (mock agents จาก
            localhost:3010)
          </p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex h-[calc(100vh-14rem)] min-h-0 flex-col">
          <AdminChatbotV2 />
        </div>
      </div>
    </div>
  );
}

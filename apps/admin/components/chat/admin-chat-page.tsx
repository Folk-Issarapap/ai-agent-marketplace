"use client";

import { useEffect, useState } from "react";
import { env } from "@/env";
import {
  DEFAULT_AGENTS,
  getChatAgents,
  type ChatAgentItem,
} from "@/lib/chat-agents";
import { getConversationList, getLastActiveId } from "@/lib/chat-history";
import { AgentManagementSheet } from "./agent-management-sheet";
import { ChatErrorBoundary } from "./chat-error-boundary";
import { AdminChatInterface } from "./admin-chat-interface";

function buildAgentsList(agents: ChatAgentItem[]): ChatAgentItem[] {
  const customHost = env.NEXT_PUBLIC_CHAT_AGENT_HOST;
  if (customHost && !agents.some((a) => a.host === customHost)) {
    return [
      { id: "custom", name: "Custom", host: customHost },
      ...agents,
    ];
  }
  return agents;
}

interface AdminChatPageProps {
  lang: string;
}

const INITIAL_AGENTS = buildAgentsList(DEFAULT_AGENTS);

export function AdminChatPage({ lang }: AdminChatPageProps) {
  const [chatAgents, setChatAgents] = useState<ChatAgentItem[]>(INITIAL_AGENTS);
  const [selectedAgentId, setSelectedAgentId] = useState(
    () => INITIAL_AGENTS[0]?.id ?? ""
  );
  const [manageSheetOpen, setManageSheetOpen] = useState(false);

  // Load agents from localStorage and restore last conversation
  useEffect(() => {
    const agents = buildAgentsList(getChatAgents());
    setChatAgents(agents);
    const last = getLastActiveId();
    getConversationList().then((res) => {
      if (!res.success || !res.data) return;
      const conv = last ? res.data.find((c) => c.id === last) : undefined;
      const agentId = conv ? conv.agentId : undefined;
      const exists = agents.some((a) => a.id === agentId);
      setSelectedAgentId(exists && agentId ? agentId : agents[0]?.id ?? "");
    });
  }, []);

  // When agents change — select first agent if current selection was removed
  useEffect(() => {
    const exists = chatAgents.some((a) => a.id === selectedAgentId);
    const first = chatAgents[0];
    if (!exists && first) {
      setSelectedAgentId(first.id);
    }
  }, [chatAgents, selectedAgentId]);

  return (
    <div className="flex size-full flex-col overflow-hidden">
      <AgentManagementSheet
        open={manageSheetOpen}
        onOpenChange={setManageSheetOpen}
        onAgentsChange={(list) => setChatAgents(buildAgentsList(list))}
      />

      {/* Chat content — key triggers remount when agent changes */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ChatErrorBoundary key={selectedAgentId}>
          <AdminChatInterface
            lang={lang}
            selectedAgentId={selectedAgentId}
            chatAgents={chatAgents}
            onAgentChange={setSelectedAgentId}
            manageSheetOpen={manageSheetOpen}
            onManageSheetOpenChange={setManageSheetOpen}
          />
        </ChatErrorBoundary>
      </div>
    </div>
  );
}

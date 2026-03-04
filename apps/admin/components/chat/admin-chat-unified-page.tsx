"use client";

import { useEffect, useMemo, useState } from "react";
import { getConversationList, getLastActiveId } from "@/lib/chat-history";
import { getProxyAgentRegistry } from "@/lib/proxy-agent-registry";
import { ChatErrorBoundary } from "./chat-error-boundary";
import { AdminChatInterface, type ChatAgentItem } from "./admin-chat-interface";

interface AdminChatUnifiedPageProps {
  lang: string;
}

function buildProxyChatAgents(): ChatAgentItem[] {
  return getProxyAgentRegistry().map((agent) => ({
    id: agent.id,
    name: agent.name,
    host: agent.url,
    description: agent.description,
  }));
}

export function AdminChatUnifiedPage({ lang }: AdminChatUnifiedPageProps) {
  const initialAgents = useMemo(() => buildProxyChatAgents(), []);
  const [chatAgents, setChatAgents] = useState<ChatAgentItem[]>(initialAgents);
  const [selectedAgentId, setSelectedAgentId] = useState(
    () => initialAgents[0]?.id ?? "",
  );

  useEffect(() => {
    const agents = buildProxyChatAgents();
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

  useEffect(() => {
    const exists = chatAgents.some((a) => a.id === selectedAgentId);
    const first = chatAgents[0];
    if (!exists && first) {
      setSelectedAgentId(first.id);
    }
  }, [chatAgents, selectedAgentId]);

  return (
    <div className="flex size-full flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ChatErrorBoundary key={selectedAgentId}>
          <AdminChatInterface
            lang={lang}
            selectedAgentId={selectedAgentId}
            chatAgents={chatAgents}
            transportMode="proxy"
            onAgentChange={setSelectedAgentId}
          />
        </ChatErrorBoundary>
      </div>
    </div>
  );
}

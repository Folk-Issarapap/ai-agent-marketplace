"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Bot } from "lucide-react";
import { useMemo, useState, useCallback } from "react";
import {
  DEFAULT_GUIDE_TIPS,
  DEFAULT_SUGGESTIONS,
  GUIDE_TIPS_BY_SLUG,
  SUGGESTIONS_BY_SLUG,
} from "./chatbot-config";
import { CloudflareChatContent } from "./chatbot-cloudflare-content";
import { ProxyChatContent } from "./chatbot-proxy-content";
import { getProxyAgentRegistry } from "@/lib/proxy-agent-registry";

/** Agent item for Chat V2 — matches proxy registry */
export type ChatV2AgentItem = {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  url?: string;
  /** "proxy" = AI SDK forward to /api/chat/agent/:slug, "cloudflare" = Cloudflare Worker */
  chatTransport?: "proxy" | "cloudflare";
  /** Cloudflare Worker model — ส่งใน body เพื่อให้ Image/Voice agent ทำงาน */
  defaultModel?: string | null;
};

function registryToAgentItem(
  item: ReturnType<typeof getProxyAgentRegistry>[number],
): ChatV2AgentItem {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug ?? null,
    description: item.description ?? null,
    url: item.url,
    chatTransport: item.chatTransport ?? "proxy",
    defaultModel: item.defaultModel ?? null,
  };
}

type AdminChatbotV2Props = {
  initialAgents?: ChatV2AgentItem[];
};

export default function AdminChatbotV2({
  initialAgents = [],
}: AdminChatbotV2Props) {
  const [text, setText] = useState("");
  const [guideOpen, setGuideOpen] = useState(false);
  const [agentSelectorOpen, setAgentSelectorOpen] = useState(false);

  const agents: ChatV2AgentItem[] = useMemo(() => {
    if (initialAgents.length > 0) return initialAgents;
    return getProxyAgentRegistry().map(registryToAgentItem);
  }, [initialAgents]);

  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(() =>
    agents.length > 0 ? agents[0]?.id ?? null : null,
  );

  const selectedAgent = useMemo(() => {
    if (!selectedAgentId) return agents[0] ?? null;
    return agents.find((a) => a.id === selectedAgentId) ?? agents[0] ?? null;
  }, [agents, selectedAgentId]);

  const tips = useMemo(
    () =>
      [...(GUIDE_TIPS_BY_SLUG[selectedAgent?.slug ?? ""] ?? DEFAULT_GUIDE_TIPS)],
    [selectedAgent?.slug],
  );

  const suggestions = useMemo(
    () =>
      [
        ...(SUGGESTIONS_BY_SLUG[selectedAgent?.slug ?? ""] ?? DEFAULT_SUGGESTIONS),
      ],
    [selectedAgent?.slug],
  );

  const handleAgentSelect = useCallback((agentId: string) => {
    setSelectedAgentId(agentId);
    setAgentSelectorOpen(false);
  }, []);

  const isCloudflare = selectedAgent?.chatTransport === "cloudflare";

  return (
    <div className="relative flex size-full flex-col divide-y overflow-hidden">
      <header className="shrink-0 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="size-5 shrink-0 text-primary" />
          <h1 className="text-lg font-semibold">
            {selectedAgent?.name ?? "Chat with Agent"}
          </h1>
          <Badge
            variant="outline"
            className="shrink-0 border-primary/30 bg-primary/5 text-primary"
          >
            V2
          </Badge>
          {isCloudflare && (
            <Badge
              variant="outline"
              className="shrink-0 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
            >
              Cloudflare
            </Badge>
          )}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {selectedAgent?.description ??
            "Select an agent from the dropdown and start the conversation"}
        </p>
      </header>
      {/* Cloudflare: ใช้ useAgentChat ตรงไป Worker (เหมือน boat-ai-agent-app). Proxy: ใช้ useChat → /api/agents/[id]/chat → forward ไป agent */}
      {isCloudflare && selectedAgent ? (
        <CloudflareChatContent
          key={`cloudflare-${selectedAgentId}`}
          selectedAgent={selectedAgent}
          agents={agents}
          selectedAgentId={selectedAgentId}
          agentSelectorOpen={agentSelectorOpen}
          setAgentSelectorOpen={setAgentSelectorOpen}
          handleAgentSelect={handleAgentSelect}
          tips={tips}
          suggestions={suggestions}
          guideOpen={guideOpen}
          setGuideOpen={setGuideOpen}
          text={text}
          setText={setText}
        />
      ) : (
        <ProxyChatContent
          key={`proxy-${selectedAgentId ?? "none"}`}
          selectedAgentId={selectedAgentId}
          selectedAgent={selectedAgent}
          agents={agents}
          agentSelectorOpen={agentSelectorOpen}
          setAgentSelectorOpen={setAgentSelectorOpen}
          handleAgentSelect={handleAgentSelect}
          tips={tips}
          suggestions={suggestions}
          guideOpen={guideOpen}
          setGuideOpen={setGuideOpen}
          text={text}
          setText={setText}
        />
      )}
    </div>
  );
}

export type ProxyAgentTransport = "proxy" | "cloudflare";

export type ProxyAgentRegistryItem = {
  id: string;
  name: string;
  description?: string;
  url: string;
  chatTransport: ProxyAgentTransport;
  agentType?: string;
  slug?: string;
};

function getDefaultBaseUrl(): string {
  return process.env.NEXT_PUBLIC_PROXY_AGENT_BASE_URL ?? "http://localhost:3010";
}

export function getProxyAgentRegistry(): ProxyAgentRegistryItem[] {
  const url = getDefaultBaseUrl();

  return [
    {
      id: "finance",
      name: "Finance Agent",
      description: "Personal finance advisor",
      url,
      chatTransport: "proxy",
      agentType: "finance",
      slug: "finance",
    },
    {
      id: "fitness",
      name: "Fitness Agent",
      description: "Fitness coach and workout planner",
      url,
      chatTransport: "proxy",
      agentType: "fitness",
      slug: "fitness",
    },
    {
      id: "study",
      name: "Study Agent",
      description: "Study coach and planning assistant",
      url,
      chatTransport: "proxy",
      agentType: "study",
      slug: "study",
    },
    {
      id: "travel",
      name: "Travel Agent",
      description: "Trip planning assistant",
      url,
      chatTransport: "proxy",
      agentType: "travel",
      slug: "travel",
    },
    {
      id: "weather",
      name: "Weather Agent",
      description: "Weather information assistant",
      url,
      chatTransport: "proxy",
      agentType: "weather",
      slug: "weather",
    },
  ];
}

export function getProxyAgentById(id: string): ProxyAgentRegistryItem | null {
  const agent = getProxyAgentRegistry().find((item) => item.id === id);
  return agent ?? null;
}

export function buildProxyAgentTargetUrl(agent: ProxyAgentRegistryItem): string {
  const normalizedBase = agent.url.replace(/\/$/, "");

  if (agent.chatTransport === "cloudflare") {
    return `${normalizedBase}/api/chat`;
  }

  const slug = encodeURIComponent(agent.slug ?? agent.agentType ?? "default");
  return `${normalizedBase}/api/chat/agent/${slug}`;
}

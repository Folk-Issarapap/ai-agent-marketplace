export type ProxyAgentTransport = "proxy" | "cloudflare";

export type ProxyAgentRegistryItem = {
  id: string;
  name: string;
  description?: string;
  url: string;
  chatTransport: ProxyAgentTransport;
  agentType?: string;
  slug?: string;
  /** Cloudflare Worker model (e.g. @cf/zai-org/glm-4.7-flash) — ส่งใน body เพื่อให้ Image/Voice agent ทำงาน */
  defaultModel?: string | null;
};

const CLOUDFLARE_WORKER_DEFAULT_URL =
  "https://boat-agent-all.atsadawat-kontha.workers.dev";

function getDefaultBaseUrl(): string {
  return process.env.NEXT_PUBLIC_PROXY_AGENT_BASE_URL ?? "http://localhost:3010";
}

function getCloudflareWorkerUrl(): string {
  return (
    process.env.NEXT_PUBLIC_CLOUDFLARE_AGENT_BASE_URL ?? CLOUDFLARE_WORKER_DEFAULT_URL
  );
}

export function getProxyAgentRegistry(): ProxyAgentRegistryItem[] {
  const url = getDefaultBaseUrl();
  const cloudflareUrl = getCloudflareWorkerUrl();

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
    // Cloudflare Workers AI agents — boat-agent-all Worker (ต้องส่ง model ใน body เหมือน boat)
    {
      id: "image",
      name: "Image Agent",
      description: "Generate images with Cloudflare Workers AI",
      url: 'https://boat-agent-all.atsadawat-kontha.workers.dev/agents/image-agent',
      chatTransport: "cloudflare",
      agentType: "image",
      slug: "image",
      defaultModel: "@cf/stabilityai/stable-diffusion-xl-base-1.0",
    },
    {
      id: "voice",
      name: "Voice Agent",
      description: "Text-to-speech with Cloudflare Workers AI",
      url: 'https://boat-agent-all.atsadawat-kontha.workers.dev/agents/voice-agent',
      chatTransport: "cloudflare",
      agentType: "voice",
      slug: "voice",
      defaultModel: "@cf/myshell-ai/melotts",
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

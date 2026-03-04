/**
 * Chat Agents - จัดการรายการ Cloudflare Chat Agents ที่ใช้ในแชท
 * เก็บใน localStorage (ไม่ต้องแก้ code เพื่อเพิ่ม/ลบ agent)
 */

const STORAGE_KEY = "admin-chat-agents";

export type ChatAgentItem = {
  id: string;
  name: string;
  host: string;
  /** Short description to help users choose an agent */
  description?: string;
};

/** Default agents when localStorage is not yet loaded */
export const DEFAULT_AGENTS: ChatAgentItem[] = [
  {
    id: "starter",
    name: "Agent Starter",
    host: "https://agents-starter.tordb-jwt.workers.dev/agents/chat-agent",
    description: "ตัวเลือกเริ่มต้นสำหรับทดสอบ",
  },
  {
    id: "food-pro",
    name: "Food Pro Agent",
    host: "https://boat-ai-agent-food-pro.atsadawat-kontha.workers.dev/",
    description: "ให้คำแนะนำด้านอาหาร โภชนาการ และเมนู",
  },
  {
    id: "agent-2",
    name: "Agent 2",
    host: "https://boat-ai-agent-2.atsadawat-kontha.workers.dev/",
    description: "สร้างคอนเทนต์ ข้อความ และไอเดีย",
  },
  {
    id: "fitness-coach",
    name: "Fitness Coach",
    host: "https://boat-agent-all.atsadawat-kontha.workers.dev/agents/fitness-coach-agent",
    description: "ออกกำลังกาย ตารางซิกแพ็ก แผนฝึก",
  },
  {
    id: "image-agent",
    name: "Image Agent",
    host: "https://boat-agent-all.atsadawat-kontha.workers.dev/agents/image-agent",
    description: "สร้างและแก้ไขรูปภาพ",
  },
  {
    id: "voice-agent",
    name: "Voice Agent",
    host: "https://boat-agent-all.atsadawat-kontha.workers.dev/agents/voice-agent",
    description: "เสียงและคำพูด",
  },
];

function isValidAgent(a: unknown): a is ChatAgentItem {
  const o = a as ChatAgentItem;
  return (
    typeof a === "object" &&
    a !== null &&
    "id" in a &&
    "name" in a &&
    "host" in a &&
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.host === "string" &&
    (o.description === undefined || typeof o.description === "string")
  );
}

function loadAgents(): ChatAgentItem[] {
  if (typeof window === "undefined") return [...DEFAULT_AGENTS];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveAgents([...DEFAULT_AGENTS]);
      return [...DEFAULT_AGENTS];
    }
    const parsed = JSON.parse(raw) as unknown;
    const arr = Array.isArray(parsed) ? parsed : [];
    const valid = arr.filter(isValidAgent);
    if (valid.length === 0) {
      saveAgents([...DEFAULT_AGENTS]);
      return [...DEFAULT_AGENTS];
    }
    return valid;
  } catch {
    saveAgents([...DEFAULT_AGENTS]);
    return [...DEFAULT_AGENTS];
  }
}

function saveAgents(agents: ChatAgentItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
  } catch {
    // ignore
  }
}

export function getChatAgents(): ChatAgentItem[] {
  return loadAgents();
}

export function addChatAgent(agent: Omit<ChatAgentItem, "id">): ChatAgentItem {
  const agents = loadAgents();
  const id = `agent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const newAgent: ChatAgentItem = { ...agent, id };
  agents.push(newAgent);
  saveAgents(agents);
  return newAgent;
}

export function updateChatAgent(
  id: string,
  updates: Partial<Pick<ChatAgentItem, "name" | "host" | "description">>
): ChatAgentItem | null {
  const agents = loadAgents();
  const idx = agents.findIndex((a) => a.id === id);
  if (idx < 0) return null;
  const current = agents[idx]!;
  const updated: ChatAgentItem = {
    id: current.id,
    name: updates.name ?? current.name,
    host: updates.host ?? current.host,
    description: updates.description ?? current.description,
  };
  agents[idx] = updated;
  saveAgents(agents);
  return updated;
}

export function deleteChatAgent(id: string): boolean {
  const agents = loadAgents();
  const filtered = agents.filter((a) => a.id !== id);
  if (filtered.length === agents.length) return false;
  saveAgents(filtered);
  return true;
}

export function reorderChatAgents(ids: string[]): ChatAgentItem[] {
  const agents = loadAgents();
  const byId = new Map(agents.map((a) => [a.id, a]));
  const reordered = ids
    .map((id) => byId.get(id))
    .filter((a): a is ChatAgentItem => !!a);
  if (reordered.length !== agents.length) return agents;
  saveAgents(reordered);
  return reordered;
}

export function resetToDefaults(): ChatAgentItem[] {
  if (typeof window === "undefined") return DEFAULT_AGENTS;
  saveAgents([...DEFAULT_AGENTS]);
  return [...DEFAULT_AGENTS];
}

/**
 * Chat history - DB persistence with localStorage for lastActiveId only
 * Re-exports server actions and client helpers
 */
import type { UIMessage } from "ai";

const LAST_ACTIVE_KEY = "admin-chat-last-active-id";

export type StoredConversation = {
  id: string;
  title: string;
  agentId: string;
  createdAt: string;
  updatedAt: string;
  messages: UIMessage[];
};

/** Client-only: last active conversation ID (survives refresh) */
export function getLastActiveId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(LAST_ACTIVE_KEY);
  } catch {
    return null;
  }
}

/** Client-only: set last active conversation ID */
export function setLastActiveId(id: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (id) localStorage.setItem(LAST_ACTIVE_KEY, id);
    else localStorage.removeItem(LAST_ACTIVE_KEY);
  } catch {
    // ignore
  }
}

export {
  getConversations,
  getConversationList,
  getConversationById,
} from "@/actions/chat/chat.query.action";

export {
  createConversation,
  updateConversationMessages,
  updateConversationTitle,
  deleteConversation,
} from "@/actions/chat/chat.mutation.action";

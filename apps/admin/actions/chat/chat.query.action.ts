"use server";

import { createClient } from "@/utils/supabase/server";
import { createSupabaseAdminClientWithoutCookies } from "@/utils/supabase/server-admin";
import type { UIMessage } from "ai";

export type StoredConversation = {
  id: string;
  title: string;
  agentId: string;
  createdAt: string;
  updatedAt: string;
  messages: UIMessage[];
};

async function getAccountId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

const DEFAULT_LIST_LIMIT = 50;

/**
 * Lightweight conversation list - metadata only, no messages.
 * Use for sidebar/history panel. Messages loaded on-demand via getConversationById.
 */
export async function getConversationList(params?: {
  limit?: number;
  offset?: number;
}): Promise<{
  success: boolean;
  data?: StoredConversation[];
  total?: number;
  error?: string;
}> {
  try {
    const accountId = await getAccountId();
    const admin = createSupabaseAdminClientWithoutCookies();
    const limit = params?.limit ?? DEFAULT_LIST_LIMIT;
    const offset = params?.offset ?? 0;

    let query = admin
      .from("chat_conversations")
      .select("id, title, agent_id, created_at, updated_at", { count: "exact" });

    if (accountId != null) {
      query = query.eq("account_id", accountId);
    } else {
      query = query.is("account_id", null);
    }

    const { data: convs, error: convError, count } = await query
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (convError) {
      console.error("[chat.getConversationList] error:", convError);
      return { success: false, error: convError.message };
    }

    const result: StoredConversation[] = (convs ?? []).map(
      (c: {
        id: string;
        title: string;
        agent_id: string;
        created_at: string;
        updated_at: string;
      }) => ({
        id: c.id,
        title: c.title ?? "New chat",
        agentId: c.agent_id,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        messages: [],
      })
    );

    return {
      success: true,
      data: result,
      total: count ?? undefined,
    };
  } catch (err) {
    console.error("[chat.getConversationList] unexpected error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function getConversations(): Promise<{
  success: boolean;
  data?: StoredConversation[];
  error?: string;
}> {
  try {
    const accountId = await getAccountId();
    const admin = createSupabaseAdminClientWithoutCookies();

    let query = admin
      .from("chat_conversations")
      .select("id, title, agent_id, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (accountId != null) {
      query = query.eq("account_id", accountId);
    } else {
      query = query.is("account_id", null);
    }

    const { data: convs, error: convError } = await query;

    if (convError) {
      console.error("[chat.getConversations] error:", convError);
      return { success: false, error: convError.message };
    }

    if (!convs || convs.length === 0) {
      return { success: true, data: [] };
    }

    const ids = convs.map((c: { id: string }) => c.id);
    const { data: msgs, error: msgError } = await admin
      .from("chat_messages")
      .select("conversation_id, content, message_index")
      .in("conversation_id", ids)
      .order("message_index", { ascending: true });

    if (msgError) {
      console.error("[chat.getConversations] messages error:", msgError);
      return { success: false, error: msgError.message };
    }

    const messagesByConv = new Map<
      string,
      Array<{ content: unknown; message_index: number }>
    >();
    for (const m of msgs ?? []) {
      const list = messagesByConv.get(m.conversation_id) ?? [];
      list.push({ content: m.content, message_index: m.message_index });
      messagesByConv.set(m.conversation_id, list);
    }

    const result: StoredConversation[] = convs.map(
      (c: {
        id: string;
        title: string;
        agent_id: string;
        created_at: string;
        updated_at: string;
      }) => {
        const list = messagesByConv.get(c.id) ?? [];
        list.sort((a, b) => a.message_index - b.message_index);
        const messages = list.map((x) => x.content as UIMessage);
        return {
          id: c.id,
          title: c.title ?? "New chat",
          agentId: c.agent_id,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
          messages,
        };
      }
    );

    return { success: true, data: result };
  } catch (err) {
    console.error("[chat.getConversations] unexpected error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function getConversationById(
  id: string
): Promise<{
  success: boolean;
  data?: StoredConversation | null;
  error?: string;
}> {
  try {
    const accountId = await getAccountId();
    const admin = createSupabaseAdminClientWithoutCookies();

    const { data: conv, error: convError } = await admin
      .from("chat_conversations")
      .select("id, title, agent_id, account_id, created_at, updated_at")
      .eq("id", id)
      .single();

    if (convError || !conv) {
      return { success: true, data: null };
    }

    // Check access when logged in
    if (accountId != null && (conv as { account_id: string | null }).account_id !== accountId) {
      return { success: true, data: null };
    }

    const { data: msgs, error: msgError } = await admin
      .from("chat_messages")
      .select("content, message_index")
      .eq("conversation_id", id)
      .order("message_index", { ascending: true });

    if (msgError) {
      console.error("[chat.getConversationById] messages error:", msgError);
      return { success: false, error: msgError.message };
    }

    const sorted = (msgs ?? []).sort(
      (a, b) => (a.message_index ?? 0) - (b.message_index ?? 0)
    );
    const messages = sorted.map((m) => m.content as UIMessage);

    return {
      success: true,
      data: {
        id: conv.id,
        title: conv.title ?? "New chat",
        agentId: conv.agent_id,
        createdAt: conv.created_at,
        updatedAt: conv.updated_at,
        messages,
      },
    };
  } catch (err) {
    console.error("[chat.getConversationById] unexpected error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

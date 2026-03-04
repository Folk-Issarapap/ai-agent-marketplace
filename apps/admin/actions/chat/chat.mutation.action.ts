"use server";

import type { UIMessage } from "ai";
import { createClient } from "@/utils/supabase/server";
import { createSupabaseAdminClientWithoutCookies } from "@/utils/supabase/server-admin";

async function getAccountId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function createConversation(
  agentId: string,
  initialTitle = "New chat"
): Promise<{
  success: boolean;
  data?: { id: string; title: string; agentId: string; createdAt: string; updatedAt: string; messages: UIMessage[] };
  error?: string;
}> {
  try {
    const accountId = await getAccountId();
    const admin = createSupabaseAdminClientWithoutCookies();

    const { data: conv, error } = await admin
      .from("chat_conversations")
      .insert({
        title: initialTitle,
        agent_id: agentId,
        account_id: accountId,
      })
      .select("id, title, agent_id, created_at, updated_at")
      .single();

    if (error) {
      console.error("[chat.createConversation] error:", error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: {
        id: conv.id,
        title: conv.title ?? "New chat",
        agentId: conv.agent_id,
        createdAt: conv.created_at,
        updatedAt: conv.updated_at,
        messages: [],
      },
    };
  } catch (err) {
    console.error("[chat.createConversation] unexpected error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function updateConversationMessages(
  id: string,
  messages: UIMessage[],
  title?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const accountId = await getAccountId();
    const admin = createSupabaseAdminClientWithoutCookies();

    // Verify ownership
    const { data: conv, error: fetchError } = await admin
      .from("chat_conversations")
      .select("account_id")
      .eq("id", id)
      .single();

    if (fetchError || !conv) {
      return { success: false, error: "Conversation not found" };
    }

    const c = conv as { account_id: string | null };
    if (accountId != null && c.account_id !== accountId) {
      return { success: false, error: "Forbidden" };
    }

    if (title !== undefined && title.trim()) {
      await admin
        .from("chat_conversations")
        .update({ title: title.trim(), updated_at: new Date().toISOString() })
        .eq("id", id);
    } else {
      await admin
        .from("chat_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", id);
    }

    // Replace all messages
    await admin.from("chat_messages").delete().eq("conversation_id", id);

    if (messages.length > 0) {
      const rows = messages.map((msg, i) => ({
        conversation_id: id,
        message_index: i,
        content: msg as unknown,
      }));
      await admin.from("chat_messages").insert(rows);
    }

    return { success: true };
  } catch (err) {
    console.error("[chat.updateConversationMessages] unexpected error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function updateConversationTitle(
  id: string,
  title: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const accountId = await getAccountId();
    const admin = createSupabaseAdminClientWithoutCookies();

    const { data: conv, error: fetchError } = await admin
      .from("chat_conversations")
      .select("account_id")
      .eq("id", id)
      .single();

    if (fetchError || !conv) {
      return { success: false, error: "Conversation not found" };
    }

    const c = conv as { account_id: string | null };
    if (accountId != null && c.account_id !== accountId) {
      return { success: false, error: "Forbidden" };
    }

    const { error } = await admin
      .from("chat_conversations")
      .update({
        title: title.trim() || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.error("[chat.updateConversationTitle] unexpected error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function deleteConversation(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const accountId = await getAccountId();
    const admin = createSupabaseAdminClientWithoutCookies();

    const { data: conv, error: fetchError } = await admin
      .from("chat_conversations")
      .select("account_id")
      .eq("id", id)
      .single();

    if (fetchError || !conv) {
      return { success: false, error: "Conversation not found" };
    }

    const c = conv as { account_id: string | null };
    if (accountId != null && c.account_id !== accountId) {
      return { success: false, error: "Forbidden" };
    }

    const { error } = await admin.from("chat_conversations").delete().eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.error("[chat.deleteConversation] unexpected error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

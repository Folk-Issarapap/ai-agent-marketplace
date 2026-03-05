"use client";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageBranch,
  MessageBranchContent,
  MessageContent,
} from "@/components/ai-elements/message";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithApprovalResponses,
} from "ai";
import type { UIMessage } from "ai";
import {
  createConversation,
  deleteConversation,
  getConversationById,
  getConversationList,
  getLastActiveId,
  setLastActiveId,
  updateConversationMessages,
  updateConversationTitle,
  type StoredConversation,
} from "@/lib/chat-history";
import { History, MessageCircle, MessageSquare, MoreHorizontal, Pencil, Plus, Search, Trash2, Download } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Input } from "@workspace/ui/components/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { cn } from "@workspace/ui/lib/utils";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import type { ChatV2AgentItem } from "./admin-chatbot-v2";
import { ChatPromptSection } from "./chatbot-shared-ui";
import { MessageParts } from "./chatbot-tool-parts";

const CHAT_V2_NEW_CHAT_KEY = "admin-chat-v2-new-chat";

function getTextFromMessage(msg: UIMessage): string {
  const parts =
    msg.parts?.filter(
      (p): p is { type: "text"; text: string } => p.type === "text",
    ) ?? [];
  return (
    parts
      .map((p) => p.text)
      .join("")
      .slice(0, 50) || "New chat"
  );
}

function parseAsUtc(dateStr: string): Date {
  const s = String(dateStr).trim();
  if (!s) return new Date();
  if (s.endsWith("Z") || /[+-]\d{2}:?\d{2}$/.test(s)) return new Date(s);
  return new Date(s + "Z");
}

function getSearchableText(conv: StoredConversation): string {
  const title = conv.title.toLowerCase();
  const msgTexts = conv.messages
    .map((m) =>
      (m.parts ?? [])
        .filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join(" "),
    )
    .join(" ")
    .toLowerCase();
  return `${title} ${msgTexts}`;
}

function exportConversationAsMarkdown(conv: StoredConversation): string {
  const lines: string[] = [`# ${conv.title}\n`];
  for (const msg of conv.messages) {
    const role = msg.role === "user" ? "คุณ" : "ผู้ช่วย";
    const text =
      (msg.parts ?? [])
        .filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join("") || "";
    lines.push(`**${role}:**\n${text}\n`);
  }
  return lines.join("\n");
}

type ProxyChatContentProps = {
  selectedAgentId: string | null;
  selectedAgent: ChatV2AgentItem | null;
  agents: ChatV2AgentItem[];
  agentSelectorOpen: boolean;
  setAgentSelectorOpen: (v: boolean) => void;
  handleAgentSelect: (id: string) => void;
  tips: string[];
  suggestions: string[];
  guideOpen: boolean;
  setGuideOpen: React.Dispatch<React.SetStateAction<boolean>>;
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
};

export function ProxyChatContent({
  selectedAgentId,
  selectedAgent,
  agents,
  agentSelectorOpen,
  setAgentSelectorOpen,
  handleAgentSelect,
  tips,
  suggestions,
  guideOpen,
  setGuideOpen,
  text,
  setText,
}: ProxyChatContentProps) {
  const chatApi = selectedAgentId
    ? `/api/agents/${selectedAgentId}/chat`
    : "";
  const {
    messages,
    setMessages,
    sendMessage,
    status,
    addToolApprovalResponse,
  } = useChat({
    transport: new DefaultChatTransport({ api: chatApi }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
  });

  const [historySheetOpen, setHistorySheetOpen] = useState(false);
  const [conversations, setConversations] = useState<StoredConversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<{ id: string; title: string } | null>(null);
  const [renameInput, setRenameInput] = useState("");
  const loadedConvIdRef = useRef<string | null>(null);
  const creatingConvRef = useRef(false);

  // Load conversation list + restore last active on mount
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const isNewChatRequested =
        typeof window !== "undefined" &&
        sessionStorage.getItem(CHAT_V2_NEW_CHAT_KEY) === "1";
      if (isNewChatRequested) sessionStorage.removeItem(CHAT_V2_NEW_CHAT_KEY);

      const res = await getConversationList();
      if (cancelled) return;
      if (res.success && res.data) {
        setConversations(res.data);
      } else {
        setConversations([]);
      }

      const navType =
        typeof performance !== "undefined" &&
        typeof performance.getEntriesByType === "function"
          ? (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)?.type
          : undefined;
      const isRefresh = navType === "reload" || navType === "back_forward";
      const last = getLastActiveId();
      const convs = res.success && res.data ? res.data : [];
      const conv = last ? convs.find((c) => c.id === last) : undefined;
      const sameAgent = conv?.agentId === selectedAgentId;
      if (!isNewChatRequested && isRefresh && last && conv && sameAgent) {
        setCurrentConvId(last);
      }
      setIsHydrated(true);
      setIsLoadingHistory(false);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [selectedAgentId]);

  // Load messages when selecting a conversation
  useEffect(() => {
    if (!currentConvId || !isHydrated) return;
    if (loadedConvIdRef.current === currentConvId) return;
    loadedConvIdRef.current = currentConvId;
    let cancelled = false;
    getConversationById(currentConvId).then((res) => {
      if (cancelled) return;
      if (res.success && res.data?.messages.length) {
        setMessages(res.data.messages as UIMessage[]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [currentConvId, isHydrated, setMessages]);

  useEffect(() => {
    if (currentConvId) setLastActiveId(currentConvId);
  }, [currentConvId]);

  // Create conversation in DB after first exchange
  useEffect(() => {
    if (
      !selectedAgentId ||
      currentConvId != null ||
      messages.length < 2 ||
      status !== "ready" ||
      creatingConvRef.current
    )
      return;
    const lastMsg = messages[messages.length - 1];
    if ((lastMsg as UIMessage)?.role !== "assistant") return;

    creatingConvRef.current = true;
    const firstUserMsg = messages[0];
    const title = firstUserMsg ? getTextFromMessage(firstUserMsg) : "New chat";
    let cancelled = false;
    createConversation(selectedAgentId, title).then(async (res) => {
      if (cancelled || !res.success || !res.data) {
        creatingConvRef.current = false;
        return;
      }
      const { id, agentId, createdAt, updatedAt } = res.data;
      await updateConversationMessages(id, [...messages]);
      if (cancelled) {
        creatingConvRef.current = false;
        return;
      }
      creatingConvRef.current = false;
      setCurrentConvId(id);
      setLastActiveId(id);
      setConversations((prev) => [
        { id, title, agentId, createdAt, updatedAt, messages: [] },
        ...prev,
      ]);
    });
    return () => {
      cancelled = true;
    };
  }, [currentConvId, messages, selectedAgentId, status]);

  // Debounced save when messages change
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!currentConvId || messages.length === 0 || status !== "ready") return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveTimeoutRef.current = null;
      const firstMsg = messages[0];
      const title = firstMsg ? getTextFromMessage(firstMsg) : "New chat";
      updateConversationMessages(currentConvId, messages, title).then((res) => {
        if (!res.success) return;
        setConversations((prev) =>
          prev.map((c) =>
            c.id === currentConvId
              ? { ...c, title, updatedAt: new Date().toISOString() }
              : c,
          ),
        );
      });
    }, 800);
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [currentConvId, messages, status]);

  const handleNewChat = useCallback(() => {
    if (!selectedAgentId) return;
    if (typeof window !== "undefined")
      sessionStorage.setItem(CHAT_V2_NEW_CHAT_KEY, "1");
    setCurrentConvId(null);
    setMessages([]);
    setHistorySheetOpen(false);
  }, [selectedAgentId, setMessages]);

  const handleSelectConversation = useCallback(
    (conv: StoredConversation) => {
      setCurrentConvId(conv.id);
      setLastActiveId(conv.id);
      setMessages(conv.messages ?? []);
      setHistorySheetOpen(false);
    },
    [setMessages],
  );

  const handleDeleteConversation = useCallback(
    async (id: string) => {
      const res = await deleteConversation(id);
      if (!res.success) return;
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (currentConvId === id) {
        setCurrentConvId(null);
        setMessages([]);
      }
      setDeleteTargetId(null);
      setHistorySheetOpen(false);
    },
    [currentConvId, setMessages],
  );

  const handleRenameConversation = useCallback(
    async (id: string, newTitle: string) => {
      const trimmed = newTitle.trim();
      if (trimmed) {
        const res = await updateConversationTitle(id, trimmed);
        if (!res.success) return;
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, title: trimmed } : c)),
        );
      }
      setRenameTarget(null);
      setRenameInput("");
    },
    [],
  );

  const openRenameDialog = (conv: StoredConversation) => {
    setRenameTarget({ id: conv.id, title: conv.title });
    setRenameInput(conv.title);
  };

  const handleExportConversation = useCallback((conv: StoredConversation) => {
    const content = exportConversationAsMarkdown(conv);
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${conv.title.replace(/[^a-zA-Z0-9ก-๙\s-]/g, "")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    return getSearchableText(c).includes(searchQuery.toLowerCase().trim());
  });

  const getAgentName = (agentId: string) =>
    agents.find((a) => a.id === agentId)?.name ?? agentId;

  const isSubmitDisabled = useMemo(
    () =>
      !selectedAgent ||
      !text.trim() ||
      status === "streaming" ||
      status === "submitted",
    [selectedAgent, text, status],
  );

  const displayStatus: "ready" | "submitted" | "streaming" | "error" =
    status === "streaming" || status === "submitted"
      ? status
      : status === "error"
        ? "error"
        : "ready";

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      if (!(message.text?.trim() || (message.files?.length ?? 0))) return;
      if (displayStatus === "streaming" || displayStatus === "submitted")
        return;
      if (message.files?.length) {
        toast.success("Files attached", {
          description: `${message.files.length} file(s) attached to message`,
        });
      }
      sendMessage({ text: message.text || "Sent with attachments" });
      setText("");
    },
    [sendMessage, displayStatus, setText],
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      if (displayStatus === "streaming" || displayStatus === "submitted")
        return;
      sendMessage({ text: suggestion });
    },
    [sendMessage, displayStatus],
  );

  const handleTranscriptionChange = useCallback(
    (transcript: string) =>
      setText((prev: string) => (prev ? `${prev} ${transcript}` : transcript)),
    [setText],
  );

  const promptStatus = useMemo<"ready" | "submitted" | "streaming" | "error">(
    () => displayStatus,
    [displayStatus],
  );

  return (
    <>
      {/* History + New chat bar */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b bg-muted/30 px-4 py-3">
        <Sheet open={historySheetOpen} onOpenChange={setHistorySheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <History className="size-4" />
              ประวัติแชท
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 sm:max-w-sm">
            <SheetHeader>
              <SheetTitle>ประวัติแชท</SheetTitle>
            </SheetHeader>
            <div className="mt-6 overflow-y-auto">
              {!isHydrated || isLoadingHistory ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  กำลังโหลด...
                </p>
              ) : (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full gap-2"
                    onClick={handleNewChat}
                    disabled={!selectedAgentId}
                  >
                    <Plus className="size-4" />
                    New chat
                  </Button>
                  {conversations.length > 0 && (
                    <div className="relative mt-4">
                      <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="ค้นหาแชท..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9 pl-8"
                      />
                    </div>
                  )}
                  {filteredConversations.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      {conversations.length > 0 ? "ไม่พบแชทที่ค้นหา" : "ยังไม่มีแชท"}
                    </p>
                  ) : (
                    <ul className="mt-4 space-y-1">
                      {filteredConversations.map((conv) => (
                        <li
                          key={conv.id}
                          className={cn(
                            "group flex items-center gap-1 rounded-lg transition-colors",
                            "hover:bg-muted/80",
                            currentConvId === conv.id && "bg-primary/10",
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              handleSelectConversation(conv);
                            }}
                            className={cn(
                              "min-w-0 flex-1 px-3 py-2.5 text-left text-sm",
                              currentConvId === conv.id
                                ? "text-primary"
                                : "text-foreground",
                            )}
                          >
                            <div className="flex min-w-0 flex-1 flex-col">
                              <div className="flex items-center gap-2">
                                <MessageCircle className="size-4 shrink-0 text-muted-foreground" />
                                <span className="truncate">{conv.title}</span>
                              </div>
                              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span className="truncate">
                                  {formatDistanceToNow(parseAsUtc(conv.updatedAt), {
                                    addSuffix: true,
                                  })}
                                </span>
                                <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px]">
                                  {getAgentName(conv.agentId)}
                                </span>
                              </div>
                            </div>
                          </button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 shrink-0 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
                                onClick={(e) => e.stopPropagation()}
                                aria-label="เปิดเมนู"
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openRenameDialog(conv);
                                }}
                              >
                                <Pencil className="size-4" />
                                เปลี่ยนชื่อ
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExportConversation(conv);
                                }}
                              >
                                <Download className="size-4" />
                                ส่งออก
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteTargetId(conv.id);
                                }}
                              >
                                <Trash2 className="size-4" />
                                ลบ
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Dialog
                    open={renameTarget != null}
                    onOpenChange={(open) => {
                      if (!open) {
                        setRenameTarget(null);
                        setRenameInput("");
                      }
                    }}
                  >
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>เปลี่ยนชื่อแชท</DialogTitle>
                      </DialogHeader>
                      <Input
                        value={renameInput}
                        onChange={(e) => setRenameInput(e.target.value)}
                        placeholder="ชื่อแชท"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && renameTarget) {
                            handleRenameConversation(renameTarget.id, renameInput);
                          }
                        }}
                      />
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setRenameTarget(null);
                            setRenameInput("");
                          }}
                        >
                          ยกเลิก
                        </Button>
                        <Button
                          onClick={() =>
                            renameTarget &&
                            handleRenameConversation(renameTarget.id, renameInput)
                          }
                        >
                          บันทึก
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <AlertDialog
                    open={deleteTargetId != null}
                    onOpenChange={(open) => !open && setDeleteTargetId(null)}
                  >
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>ลบแชท</AlertDialogTitle>
                        <AlertDialogDescription>
                          การดำเนินการนี้ไม่สามารถย้อนกลับได้
                          คุณแน่ใจหรือไม่ว่าต้องการลบแชทนี้
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={() =>
                            deleteTargetId && handleDeleteConversation(deleteTargetId)
                          }
                        >
                          ลบ
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleNewChat}
          disabled={!selectedAgentId || status === "streaming"}
        >
          <Plus className="size-4" />
          New chat
        </Button>
      </div>

      <Conversation>
        <ConversationContent>
          {messages.length === 0 && (
            <ConversationEmptyState
              icon={<MessageSquare className="size-12" />}
              title="Start a conversation"
              description="Type a message below to begin chatting"
            />
          )}
          {messages.map((message) => {
            const from =
              message.role === "user" ? "user" : "assistant";
            const parts = message.parts ?? [];
            return (
              <MessageBranch defaultBranch={0} key={message.id}>
                <MessageBranchContent>
                  <Message from={from}>
                    <div>
                      <MessageContent>
                        <MessageParts
                          parts={parts}
                          addToolApprovalResponse={addToolApprovalResponse}
                        />
                      </MessageContent>
                    </div>
                  </Message>
                </MessageBranchContent>
              </MessageBranch>
            );
          })}
          {(displayStatus === "submitted" || displayStatus === "streaming") && (
            <MessageBranch defaultBranch={0} key="reasoning">
              <MessageBranchContent>
                <Message from="assistant" key="reasoning-msg">
                  <MessageContent>
                    <Reasoning className="w-full" isStreaming>
                      <ReasoningTrigger />
                      <ReasoningContent>{""}</ReasoningContent>
                    </Reasoning>
                  </MessageContent>
                </Message>
              </MessageBranchContent>
            </MessageBranch>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <ChatPromptSection
        tips={tips}
        suggestions={suggestions}
        guideOpen={guideOpen}
        setGuideOpen={setGuideOpen}
        text={text}
        setText={setText}
        status={promptStatus}
        isSubmitDisabled={isSubmitDisabled}
        selectedAgent={selectedAgent}
        agents={agents}
        selectedAgentId={selectedAgentId}
        agentSelectorOpen={agentSelectorOpen}
        setAgentSelectorOpen={setAgentSelectorOpen}
        handleAgentSelect={handleAgentSelect}
        onSubmit={handleSubmit}
        onSuggestionClick={handleSuggestionClick}
        onTranscriptionChange={handleTranscriptionChange}
      />
    </>
  );
}

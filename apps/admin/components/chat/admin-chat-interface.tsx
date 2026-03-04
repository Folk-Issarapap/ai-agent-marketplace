"use client";

import { useAgentChat } from "@cloudflare/ai-chat/react";
import { useAgent } from "agents/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
  type UIMessage,
} from "ai";
import { useChat } from "@ai-sdk/react";
import {
  MessageSquare,
  History,
  Plus,
  MessageCircle,
  MoreHorizontal,
  Trash2,
  Pencil,
  Download,
  Search,
  Paperclip,
  Copy,
  RotateCw,
  ChevronsUpDown,
  ChevronDown,
  Settings2,
  Loader2,
  ImageIcon,
  Music2Icon,
  AlertCircle,
  Lightbulb,
  Mic,
  Square,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Attachments,
  Attachment,
  AttachmentInfo,
  AttachmentPreview,
  AttachmentRemove,
} from "@/components/ai-elements/attachments";
import {
  Confirmation,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationRequest,
  ConfirmationTitle,
} from "@/components/ai-elements/confirmation";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageAttachments,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";
import { Button } from "@workspace/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { cn } from "@workspace/ui/lib/utils";
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
import { formatDistanceToNow } from "date-fns";

/** Parse date string as UTC when missing timezone (Supabase returns UTC without Z) */
function parseAsUtc(dateStr: string): Date {
  const s = String(dateStr).trim();
  if (!s) return new Date();
  if (s.endsWith("Z") || /[+-]\d{2}:?\d{2}$/.test(s)) return new Date(s);
  return new Date(s + "Z");
}
import type { AttachmentData } from "@/components/ai-elements/attachments";

function InputAttachmentStrip() {
  const attachments = usePromptInputAttachments();
  if (attachments.files.length === 0) return null;
  return (
    <Attachments
      variant="inline"
      className="flex-wrap gap-1.5 border-b px-3 py-2"
    >
      {attachments.files.map((file) => (
        <Attachment
          key={file.id}
          data={file as AttachmentData}
          onRemove={() => attachments.remove(file.id)}
        >
          <AttachmentPreview />
          <AttachmentInfo />
          <AttachmentRemove />
        </Attachment>
      ))}
    </Attachments>
  );
}

export type ChatAgentItem = {
  id: string;
  name: string;
  host: string;
  description?: string;
};

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

function getFullTextFromMessage(msg: UIMessage): string {
  const parts =
    msg.parts?.filter(
      (p): p is { type: "text"; text: string } => p.type === "text",
    ) ?? [];
  return parts.map((p) => p.text).join("");
}

/**
 * Strip "reasoning" section (e.g. "The user wrote in Thai...", "I should respond in Thai...")
 * Keep only the answer shown to the user
 */
function stripReasoningFromAssistantText(text: string): string {
  if (!text || !text.includes("I should respond in")) return text;
  const idx = text.indexOf("I should respond in");
  const after = text.slice(idx);
  const nextNewline = after.indexOf("\n");
  const start = nextNewline >= 0 ? after.slice(nextNewline).trimStart() : after;
  return start || text;
}

/** Extract image URL from tool output (supports multiple formats from agents including imageBase64) */
function getImageUrlFromToolOutput(output: unknown): string | null {
  if (output == null) return null;
  if (typeof output === "string") {
    if (output.startsWith("http") || output.startsWith("data:image"))
      return output;
    return null;
  }
  if (typeof output !== "object") return null;
  const o = output as Record<string, unknown>;

  const tryUrl = (v: unknown): string | null => {
    if (
      typeof v === "string" &&
      (v.startsWith("http") || v.startsWith("data:image"))
    )
      return v;
    return null;
  };

  /** Supports tool-generateImage format: output.imageBase64 (base64 string) */
  const tryBase64 = (v: unknown): string | null => {
    if (typeof v !== "string" || !v.trim()) return null;
    const b64 = v.trim();
    if (/^[A-Za-z0-9+/=]+$/.test(b64)) return `data:image/png;base64,${b64}`;
    return null;
  };

  const urlKeys = [
    "url",
    "imageUrl",
    "image_url",
    "image",
    "src",
    "source",
  ] as const;
  for (const k of urlKeys) {
    const v = o[k];
    const u = tryUrl(v);
    if (u) return u;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const inner =
        (v as Record<string, unknown>).url ??
        (v as Record<string, unknown>).imageUrl ??
        (v as Record<string, unknown>).image_url;
      const u2 = tryUrl(inner);
      if (u2) return u2;
    }
  }

  const base64Keys = ["imageBase64", "image_base64", "base64", "data"] as const;
  for (const k of base64Keys) {
    const v = o[k];
    const dataUrl = tryBase64(v);
    if (dataUrl) return dataUrl;
  }

  if (o.data && typeof o.data === "object" && !Array.isArray(o.data)) {
    const dataObj = o.data as Record<string, unknown>;
    const u = tryUrl(dataObj.url ?? dataObj.imageUrl);
    if (u) return u;
    const dataUrl = tryBase64(dataObj.imageBase64 ?? dataObj.image_base64);
    if (dataUrl) return dataUrl;
  }
  if (o.result && typeof o.result === "object") {
    const resultObj = o.result as Record<string, unknown>;
    const u = tryUrl(resultObj.url ?? resultObj.imageUrl);
    if (u) return u;
    const dataUrl = tryBase64(resultObj.imageBase64 ?? resultObj.image_base64);
    if (dataUrl) return dataUrl;
  }
  return null;
}

/** Check if tool is for image generation */
function isImageTool(toolType: string): boolean {
  const t = toolType.toLowerCase();
  return t.includes("image") || t.includes("generateimage");
}

/** Check if tool is for audio/voice generation */
function isAudioTool(toolType: string): boolean {
  const t = toolType.toLowerCase();
  return (
    t.includes("audio") ||
    t.includes("voice") ||
    t.includes("speech") ||
    t.includes("tts") ||
    t.includes("texttospeech")
  );
}

/** Extract audio URL from tool output (supports url, audioUrl, base64 data URLs) */
function getAudioUrlFromToolOutput(output: unknown): string | null {
  if (output == null) return null;
  if (typeof output === "string") {
    if (output.startsWith("http") || output.startsWith("data:audio"))
      return output;
    return null;
  }
  if (typeof output !== "object") return null;
  const o = output as Record<string, unknown>;

  const tryUrl = (v: unknown): string | null => {
    if (
      typeof v === "string" &&
      (v.startsWith("http") || v.startsWith("data:audio"))
    )
      return v;
    return null;
  };

  /** Convert base64 to data URL for audio */
  const tryBase64 = (v: unknown, mime = "audio/mpeg"): string | null => {
    if (typeof v !== "string" || !v.trim()) return null;
    const b64 = v.trim();
    if (/^[A-Za-z0-9+/=]+$/.test(b64)) return `data:${mime};base64,${b64}`;
    return null;
  };

  const urlKeys = [
    "url",
    "audioUrl",
    "audio_url",
    "audio",
    "src",
    "source",
    "downloadUrl",
    "mediaUrl",
    "fileUrl",
  ] as const;
  for (const k of urlKeys) {
    const v = o[k];
    const u = tryUrl(v);
    if (u) return u;
  }

  const base64Keys = [
    "audioBase64",
    "audio_base64",
    "base64",
    "data",
    "content",
  ] as const;
  for (const k of base64Keys) {
    const v = o[k];
    const dataUrl = tryBase64(v);
    if (dataUrl) return dataUrl;
  }

  const nestedObjs = [
    o.data,
    o.result,
    o.audio,
    o.file,
    o.output,
    o.response,
  ] as unknown[];
  for (const obj of nestedObjs) {
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      const rec = obj as Record<string, unknown>;
      const u = tryUrl(
        rec.url ?? rec.audioUrl ?? rec.audio_url ?? rec.audio ?? rec.src,
      );
      if (u) return u;
      const dataUrl = tryBase64(
        rec.audioBase64 ?? rec.audio_base64 ?? rec.base64 ?? rec.content,
      );
      if (dataUrl) return dataUrl;
    }
  }

  return null;
}

/** Check if tool is still pending (not yet complete) */
function isToolPending(state: string): boolean {
  return (
    state === "input-available" ||
    state === "input-streaming" ||
    state === "output-streaming"
  );
}

/** Image card from tool with download/copy buttons, shows feedback on success */
function GeneratedImageCard({
  imageUrl,
  alt,
}: {
  imageUrl: string;
  alt: string;
}) {
  const [feedback, setFeedback] = useState<"downloaded" | "copied" | null>(
    null,
  );

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 2000);
    return () => clearTimeout(t);
  }, [feedback]);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `generated-image-${Date.now()}.png`;
    a.click();
    setFeedback("downloaded");
  };

  const handleCopy = async () => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setFeedback("copied");
    } catch {
      // fallback ignored
    }
  };

  return (
    <div className="mt-2 overflow-hidden rounded-lg border bg-muted/30">
      <img
        src={imageUrl}
        alt={alt}
        className="max-h-80 w-full object-contain"
      />
      <div className="flex items-center justify-end gap-1 border-t bg-muted/20 px-2 py-1.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={handleDownload}
        >
          <Download className="size-3.5" />
          {feedback === "downloaded" ? "ดาวน์โหลดแล้ว" : "ดาวน์โหลด"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={handleCopy}
        >
          <Copy className="size-3.5" />
          {feedback === "copied" ? "คัดลอกแล้ว" : "คัดลอก"}
        </Button>
      </div>
    </div>
  );
}

/** Audio player card from voice/speech tool with download button */
function GeneratedAudioCard({ audioUrl }: { audioUrl: string }) {
  const [feedback, setFeedback] = useState<"downloaded" | null>(null);

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 2000);
    return () => clearTimeout(t);
  }, [feedback]);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = audioUrl;
    const ext =
      audioUrl.includes(".mp3") || audioUrl.startsWith("data:audio/mpeg")
        ? "mp3"
        : audioUrl.includes(".wav") || audioUrl.startsWith("data:audio/wav")
          ? "wav"
          : "mp3";
    a.download = `generated-audio-${Date.now()}.${ext}`;
    a.click();
    setFeedback("downloaded");
  };

  return (
    <div className="mt-2 overflow-hidden rounded-lg border bg-muted/30">
      <audio className="w-full" controls preload="metadata" src={audioUrl} />
      <div className="flex items-center justify-end gap-1 border-t bg-muted/20 px-2 py-1.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={handleDownload}
        >
          <Download className="size-3.5" />
          {feedback === "downloaded" ? "ดาวน์โหลดแล้ว" : "ดาวน์โหลด"}
        </Button>
      </div>
    </div>
  );
}

/** Detect if response might be truncated — only when clear signals (ends with space or conjunction) */
function looksTruncated(text: string): boolean {
  const t = text.trim();
  if (t.length < 250) return false;
  // Ends with sentence-ending punctuation → unlikely to be truncated
  if (/[.!?。？！\n]$/.test(t)) return false;
  if (
    ["์", "ๆ", "ฯ", ",", ")", "]", '"', "'", ":", ";", "…"].includes(
      t.slice(-1),
    )
  )
    return false;
  if (t.endsWith("ฯลฯ") || t.endsWith("...")) return false;
  const lastFew = t.slice(-6);
  if (/\b(ครับ|ค่ะ|นะครับ|นะคะ|คะ|ฯลฯ)$/.test(lastFew)) return false;
  // Signals of incompleteness: ends with space (cut mid-word) or conjunction that often continues
  if (t.endsWith(" ")) return true;
  if (/\s(และ|หรือ|ว่า|คือ|ซึ่ง|แต่|โดย|เพื่อ)\s*$/.test(t)) return true;
  return false;
}

/** Parse goal, level, constraints from user message for Fitness Coach agent */
function parseFitnessProfileFromMessage(userText: string): {
  goal?: string;
  level?: string;
  constraints?: string;
  rawContext?: string;
} {
  const t = userText.toLowerCase();
  const result: {
    goal?: string;
    level?: string;
    constraints?: string;
    rawContext?: string;
  } = {};

  // Goal
  if (/ลดน้ำหนัก|weight\s*loss|ลดความอ้วน|slim|เผาผลาญไขมัน/i.test(t)) {
    result.goal = "weight_loss";
  } else if (/เพิ่มกล้าม|muscle\s*gain|build\s*muscle|เพิ่มมวลกล้าม/i.test(t)) {
    result.goal = "muscle_gain";
  } else if (/สุขภาพ|fitness|general|โดยรวม/i.test(t)) {
    result.goal = "general_fitness";
  } else if (/ความทนทาน|endurance|cardio/i.test(t)) {
    result.goal = "endurance";
  } else if (/ยืดหยุ่น|flexibility|โยคะ/i.test(t)) {
    result.goal = "flexibility";
  }

  // Level
  if (/เริ่มต้น|beginner|ใหม่|new|ไม่มีประสบการณ์|no\s*experience/i.test(t)) {
    result.level = "beginner";
  } else if (/ปานกลาง|intermediate|ระดับกลาง|mid/i.test(t)) {
    result.level = "intermediate";
  } else if (/มืออาชีพ|advanced|ระดับสูง|experienced|มาก่อน/i.test(t)) {
    result.level = "advanced";
  }

  // Constraints
  if (/ไม่มี|ไม่มีข้อจำกัด|no\s*constraint|none/i.test(t)) {
    result.constraints = "none";
  } else if (/บาดเจ็บ|injury|ปวด|hurt/i.test(t)) {
    result.constraints = "injury_or_limitation";
  } else if (/เวลา|time|limited|จำกัด/i.test(t)) {
    result.constraints = "time_constrained";
  } else if (/อุปกรณ์|equipment|ที่บ้าน|at\s*home/i.test(t)) {
    result.constraints = "equipment_or_location";
  }

  result.rawContext = userText.trim().slice(0, 500);
  return result;
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

interface AdminChatInterfaceProps {
  lang: string;
  selectedAgentId: string;
  chatAgents: ChatAgentItem[];
  transportMode?: "agent" | "proxy";
  onAgentChange?: (agentId: string) => void;
  manageSheetOpen?: boolean;
  onManageSheetOpenChange?: (open: boolean) => void;
}

export function AdminChatInterface({
  lang: _lang,
  selectedAgentId,
  chatAgents,
  transportMode = "agent",
  onAgentChange,
  manageSheetOpen = false,
  onManageSheetOpenChange,
}: AdminChatInterfaceProps) {
  const selectedAgent = chatAgents.find((a) => a.id === selectedAgentId);
  const isProxyMode = transportMode === "proxy";

  const [conversations, setConversations] = useState<StoredConversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [historySheetOpen, setHistorySheetOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [renameTarget, setRenameTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [renameInput, setRenameInput] = useState("");
  const [dismissedChatError, setDismissedChatError] = useState(false);
  const [guideOpen, setGuideOpen] = useState(true);
  const [draftText, setDraftText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<{
    start: () => void;
    stop: () => void;
    onresult: ((event: unknown) => void) | null;
    onend: (() => void) | null;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const isNewChatRequested =
        typeof window !== "undefined" &&
        sessionStorage.getItem("admin-chat-new-chat") === "1";
      if (isNewChatRequested) {
        sessionStorage.removeItem("admin-chat-new-chat");
      }
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
          ? (
              performance.getEntriesByType("navigation")[0] as
                | PerformanceNavigationTiming
                | undefined
            )?.type
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

  const agent = useAgent({
    agent: "ChatAgent",
    host: selectedAgent?.host ?? "",
    name: "admin",
  });

  const messagesRef = useRef<UIMessage[]>([]);

  const {
    messages: agentMessages,
    sendMessage: agentSendMessage,
    status: agentStatus,
    setMessages: setAgentMessages,
    addToolOutput: addAgentToolOutput,
  } = useAgentChat({
    agent,
    body: () => ({}),
    // Always [] for SSR/hydration — restore in useEffect to avoid server/client mismatch
    getInitialMessages: async () => [],
    // Fitness Coach: when getUserProfile is called, send data parsed from user message
    onToolCall:
      selectedAgentId === "fitness-coach"
        ? async (event) => {
            if (
              "addToolOutput" in event &&
              event.toolCall?.toolName === "getUserProfile"
            ) {
              const msgs = messagesRef.current;
              const lastUserMsg = [...msgs]
                .reverse()
                .find((m: UIMessage) => m.role === "user");
              const userText = lastUserMsg
                ? getFullTextFromMessage(lastUserMsg)
                : "";
              const parsed = parseFitnessProfileFromMessage(userText);
              event.addToolOutput?.({
                toolCallId: event.toolCall.toolCallId,
                output: {
                  found: userText.length > 0,
                  profile: userText.length > 0 ? parsed : undefined,
                  extracted_from_message: userText.length > 0,
                  message:
                    userText.length > 0
                      ? "ใช้ข้อมูลจากข้อความผู้ใช้ (วิธีที่ 2)"
                      : "ยังไม่มีข้อความจากผู้ใช้",
                },
              });
            }
          }
        : undefined,
  });

  const {
    messages: proxyMessages,
    sendMessage: proxySendMessage,
    status: proxyStatus,
    error: proxyError,
    setMessages: setProxyMessages,
    addToolApprovalResponse,
  } = useChat({
    transport: new DefaultChatTransport({
      api: selectedAgentId
        ? `/api/agents/${selectedAgentId}/chat`
        : "/api/agents/unknown/chat",
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });

  const messages = (isProxyMode ? proxyMessages : agentMessages) as UIMessage[];
  const status = (isProxyMode ? proxyStatus : agentStatus) as
    | "ready"
    | "submitted"
    | "streaming"
    | "error";
  const setMessages = useCallback(
    (nextMessages: UIMessage[]) => {
      if (isProxyMode) {
        setProxyMessages(nextMessages as never[]);
        return;
      }
      setAgentMessages(nextMessages as typeof agentMessages);
    },
    [isProxyMode, setProxyMessages, setAgentMessages, agentMessages],
  );
  const sendMessage = useCallback(
    (payload: unknown) => {
      if (isProxyMode) {
        proxySendMessage(payload as Parameters<typeof proxySendMessage>[0]);
        return;
      }
      agentSendMessage(payload as Parameters<typeof agentSendMessage>[0]);
    },
    [isProxyMode, proxySendMessage, agentSendMessage],
  );
  const addToolOutput = useCallback(
    (payload: { toolCallId: string; output: unknown }) => {
      if (isProxyMode) {
        const approved =
          typeof payload.output === "object" &&
          payload.output !== null &&
          "approved" in (payload.output as Record<string, unknown>) &&
          (payload.output as Record<string, unknown>).approved === true;
        addToolApprovalResponse({
          id: payload.toolCallId,
          approved,
        });
        return;
      }

      addAgentToolOutput(payload as Parameters<typeof addAgentToolOutput>[0]);
    },
    [isProxyMode, addToolApprovalResponse, addAgentToolOutput],
  );

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Log tool call outputs (incl. images) — open DevTools > Console to inspect agent response structure
  useEffect(() => {
    messages.forEach((msg: UIMessage, msgIdx: number) => {
      (msg.parts ?? []).forEach((part, partIdx: number) => {
        if (
          typeof part.type === "string" &&
          part.type.startsWith("tool-") &&
          ("output" in part || "errorText" in part)
        ) {
          const p = part as {
            type: string;
            toolCallId: string;
            state: string;
            input?: unknown;
            output?: unknown;
            errorText?: string;
          };
          if (p.output !== undefined || p.errorText !== undefined) {
            console.log(
              `[Admin Chat] Tool output (message ${msgIdx + 1}, part ${partIdx + 1}):`,
              {
                toolType: p.type,
                state: p.state,
                input: p.input,
                output: p.output,
                errorText: p.errorText,
              },
            );
          }
        }
      });
    });
  }, [messages]);

  // Log last agent message in console — for debugging full response (open DevTools > Console)
  useEffect(() => {
    if (messages.length === 0) return;
    const lastAssistant = [...messages]
      .reverse()
      .find((m: UIMessage) => m.role === "assistant") as UIMessage | undefined;
    if (!lastAssistant) return;
    const fullText = getFullTextFromMessage(lastAssistant);
    const partCount = (lastAssistant.parts ?? []).filter(
      (p: { type?: string }) => p.type === "text",
    ).length;
    console.log("[Admin Chat] Last assistant response:", {
      messageId: lastAssistant.id,
      textLength: fullText.length,
      partCount,
      textPreview:
        fullText.length > 200 ? `${fullText.slice(0, 200)}...` : fullText,
      fullText,
    });
  }, [messages]);

  // Restore messages after mount/hydration when currentConvId exists but messages are empty
  useEffect(() => {
    if (!currentConvId || messages.length > 0 || !isHydrated) return;
    let cancelled = false;
    getConversationById(currentConvId).then((res) => {
      if (cancelled) return;
      if (res.success && res.data?.messages.length) {
        setMessages(res.data.messages as typeof messages);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [currentConvId, messages.length, isHydrated]);

  const handleNewChat = useCallback(() => {
    if (!selectedAgentId) return;
    if (typeof window !== "undefined")
      sessionStorage.setItem("admin-chat-new-chat", "1");
    setDismissedChatError(true);
    setCurrentConvId(null);
    setMessages([]);
    setHistorySheetOpen(false);
  }, [selectedAgentId, setMessages]);

  const handleSelectConversation = useCallback(
    (conv: StoredConversation) => {
      onAgentChange?.(conv.agentId);
      setCurrentConvId(conv.id);
      setLastActiveId(conv.id);
      setMessages(conv.messages as typeof messages);
    },
    [onAgentChange, setMessages],
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

  // Save messages to DB when conversation is active and not streaming (debounced 800ms)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!currentConvId || messages.length === 0 || status !== "ready") return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveTimeoutRef.current = null;
      const firstMsg = messages[0];
      const title =
        firstMsg != null ? getTextFromMessage(firstMsg) : "New chat";
      updateConversationMessages(currentConvId, messages, title).then((res) => {
        if (!res.success) return;
        setConversations((prev) =>
          prev.map((c) =>
            c.id === currentConvId
              ? {
                  ...c,
                  title,
                  updatedAt: new Date().toISOString(),
                }
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

  useEffect(() => {
    if (currentConvId) setLastActiveId(currentConvId);
  }, [currentConvId]);

  const creatingConvRef = useRef(false);
  // Create chat in history after first exchange completes, to avoid empty/draft chats
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
    if ((lastMsg as UIMessage | undefined)?.role !== "assistant") return;

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

  const loadedConvIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!currentConvId || !isHydrated) return;
    if (loadedConvIdRef.current === currentConvId) return;
    loadedConvIdRef.current = currentConvId;
    let cancelled = false;
    getConversationById(currentConvId).then((res) => {
      if (cancelled) return;
      if (res.success && res.data?.messages.length) {
        setMessages(res.data.messages as typeof messages);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [currentConvId, isHydrated]);

  const handleSubmit = (payload: {
    text?: string;
    files?: Array<{
      type: "file";
      mediaType: string;
      url: string;
      filename?: string;
    }>;
  }) => {
    const text = (payload.text ?? draftText).trim();
    const files = payload.files ?? [];
    const hasContent = text.length > 0 || files.length > 0;
    if (!hasContent || (!isProxyMode && !agent.host) || status !== "ready")
      return;

    const parts: Array<
      | { type: "text"; text: string }
      | { type: "file"; mediaType: string; url: string; filename?: string }
    > = [];
    if (text) {
      parts.push({ type: "text", text });
    }
    for (const f of files) {
      parts.push({
        type: "file",
        mediaType: f.mediaType,
        url: f.url,
        filename: f.filename,
      });
    }

    sendMessage({ role: "user", parts } as unknown as Parameters<
      typeof sendMessage
    >[0]);
    setDraftText("");
  };
  const handleToggleListening = useCallback(() => {
    if (typeof window === "undefined") return;
    const w = window as typeof window & {
      SpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        start: () => void;
        stop: () => void;
        onresult: ((event: unknown) => void) | null;
        onend: (() => void) | null;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        start: () => void;
        stop: () => void;
        onresult: ((event: unknown) => void) | null;
        onend: (() => void) | null;
      };
    };
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognitionCtor =
      w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognitionCtor();
      recognition.lang = "th-TH";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = (event: unknown) => {
        const transcript = (
          event as {
            results?: ArrayLike<ArrayLike<{ transcript?: string }>>;
          }
        ).results?.[0]?.[0]?.transcript;
        if (!transcript) return;
        setDraftText((prev) =>
          prev.trim().length > 0
            ? `${prev.trim()} ${transcript.trim()}`
            : transcript.trim(),
        );
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      recognitionRef.current = recognition;
    }

    setIsListening(true);
    recognitionRef.current.start();
  }, [isListening]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);
  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      if (!suggestion.trim() || status !== "ready") return;
      setDismissedChatError(false);
      sendMessage({
        role: "user",
        parts: [{ type: "text", text: suggestion }],
      } as unknown as Parameters<typeof sendMessage>[0]);
    },
    [status, sendMessage],
  );

  const isLoading = status === "submitted" || status === "streaming";
  const canSend = status === "ready" && (isProxyMode || !!agent.host);
  const guideContent = useMemo(() => {
    switch (selectedAgentId) {
      case "weather":
        return {
          tips: [
            "ระบุเมือง/ประเทศให้ชัดเจน",
            "บอกช่วงเวลา เช่น วันนี้ พรุ่งนี้ หรือสุดสัปดาห์",
            "ถ้าต้องการแผนเดินทาง ให้บอกกิจกรรมและช่วงเวลา",
          ],
          suggestions: [
            "What's the weather in Bangkok today?",
            "Weather forecast for Chiang Mai this week",
            "Is it going to rain in Phuket tomorrow?",
            "Temperature and humidity in Singapore",
            "Compare weather: Bangkok vs Tokyo",
          ],
        };
      case "travel":
        return {
          tips: [
            "ระบุงบประมาณและจำนวนวัน",
            "บอกสไตล์ทริป เช่น ชิล ธรรมชาติ หรือครอบครัว",
            "เพิ่มข้อจำกัด เช่น เดินทางกับเด็กหรือผู้สูงอายุ",
          ],
          suggestions: [
            "วางแผนเที่ยวเชียงใหม่ 3 วัน งบ 12,000 บาท",
            "ทริปโตเกียว 5 วัน สำหรับครอบครัว",
            "แนะนำเมืองทะเลใกล้กรุงเทพ 2 วัน 1 คืน",
            "แพลนเที่ยวโอซาก้าแบบประหยัด",
          ],
        };
      case "fitness":
        return {
          tips: [
            "บอกเป้าหมาย เช่น ลดไขมัน เพิ่มกล้าม หรือรักษาน้ำหนัก",
            "ใส่ข้อมูลพื้นฐาน (เพศ อายุ ส่วนสูง น้ำหนัก)",
            "แจ้งข้อจำกัดสุขภาพหรืออุปกรณ์ที่มี",
          ],
          suggestions: [
            "ช่วยทำโปรแกรมลดไขมัน 4 วัน/สัปดาห์",
            "เมนูอาหาร 1 วัน โปรตีนสูง งบประหยัด",
            "ตารางเวทสำหรับมือใหม่ที่บ้าน",
            "คำนวณแคลอรีสำหรับเป้าหมายลดน้ำหนัก",
          ],
        };
      case "finance":
        return {
          tips: [
            "ระบุรายรับ-รายจ่ายต่อเดือน",
            "บอกเป้าหมายและระยะเวลา เช่น เก็บเงิน 6 เดือน",
            "แยกค่าใช้จ่ายคงที่กับค่าใช้จ่ายผันแปร",
          ],
          suggestions: [
            "ช่วยจัดงบรายเดือนจากเงินเดือน 35,000 บาท",
            "แผนออมเงินฉุกเฉินให้ครบ 100,000 บาท",
            "ลดค่าใช้จ่ายประจำแบบไม่กระทบคุณภาพชีวิต",
            "วิเคราะห์รายจ่ายและจุดที่ควรปรับ",
          ],
        };
      case "study":
        return {
          tips: [
            "ระบุวิชาหรือหัวข้อที่ต้องการเรียน",
            "บอกเวลาที่มีต่อวันและเดดไลน์",
            "แจ้งรูปแบบที่ชอบ เช่น สรุปสั้น แบบฝึกหัด หรือ quiz",
          ],
          suggestions: [
            "ช่วยวางแผนอ่านสอบคณิต 14 วัน",
            "สรุป React hooks ให้เข้าใจใน 10 นาที",
            "ออก quiz ภาษาอังกฤษ 10 ข้อพร้อมเฉลย",
            "เทคนิคจำเนื้อหาเร็วขึ้นก่อนสอบ",
          ],
        };
      default:
        return {
          tips: [
            "ระบุเป้าหมายให้ชัดเจนและมีบริบท",
            "บอกข้อจำกัด เช่น งบ เวลา หรือรูปแบบคำตอบที่ต้องการ",
            "ถ้าต้องการผลลัพธ์เฉพาะ ให้ยกตัวอย่างข้อมูลประกอบ",
          ],
          suggestions: [
            "ช่วยสรุปแผนงานวันนี้แบบสั้น",
            "ช่วยเขียน checklist สำหรับงานนี้",
            "แนะนำขั้นตอนแก้ปัญหาแบบทีละข้อ",
          ],
        };
    }
  }, [selectedAgentId]);

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    return getSearchableText(c).includes(searchQuery.toLowerCase().trim());
  });

  const getAgentName = (agentId: string) =>
    chatAgents.find((a) => a.id === agentId)?.name ?? agentId;

  const historyPanel = (
    <div className="flex flex-col gap-4">
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
            <div className="relative">
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
            <>
              <ul className="space-y-1">
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
                        setHistorySheetOpen(false);
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
            </>
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
  );

  const [selectorOpen, setSelectorOpen] = useState(false);
  const [dismissedTruncatedIds, setDismissedTruncatedIds] = useState<
    Set<string>
  >(() => new Set());

  const visibleMessages = useMemo(
    () => messages.filter((m: UIMessage) => m.role !== "system"),
    [messages],
  );
  const chatErrorMessage = useMemo(() => {
    if (status !== "error") return null;
    if (!isProxyMode) return "เกิดข้อผิดพลาดในการตอบกลับ กรุณาลองใหม่อีกครั้ง";

    const detail =
      proxyError instanceof Error ? proxyError.message.toLowerCase() : "";
    if (
      detail.includes("rate_limit") ||
      detail.includes("request too large") ||
      detail.includes("too large for model") ||
      detail.includes("tokens per minute")
    ) {
      return "คำขอนี้ยาวเกินขีดจำกัดชั่วคราวของโมเดล กรุณาลดความยาวข้อความหรือเริ่มแชทใหม่";
    }

    return "ไม่สามารถเชื่อมต่อบริการได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง";
  }, [status, isProxyMode, proxyError]);
  const pendingAssistantResponse = useMemo(() => {
    if (!isLoading) return false;

    let lastUserIndex = -1;
    let lastAssistantIndex = -1;

    for (let i = visibleMessages.length - 1; i >= 0; i--) {
      const message = visibleMessages[i];
      if (!message) continue;

      if (lastUserIndex < 0 && message.role === "user") {
        lastUserIndex = i;
      }

      if (lastAssistantIndex < 0 && message.role === "assistant") {
        const hasText = getFullTextFromMessage(message).trim().length > 0;
        const hasRenderablePart = (message.parts ?? []).some(
          (part) => part.type !== "text" && part.type !== "step-start",
        );
        if (hasText || hasRenderablePart) {
          lastAssistantIndex = i;
        }
      }

      if (lastUserIndex >= 0 && lastAssistantIndex >= 0) break;
    }

    if (lastUserIndex < 0) return true;
    return lastAssistantIndex < lastUserIndex;
  }, [isLoading, visibleMessages]);

  return (
    <div className="relative flex size-full flex-col overflow-hidden">
      {/* Chat history + New Chat button bar */}
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
            <div className="mt-6 overflow-y-auto">{historyPanel}</div>
          </SheetContent>
        </Sheet>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleNewChat}
          disabled={!selectedAgentId}
        >
          <Plus className="size-4" />
          New chat
        </Button>
      </div>

      <Conversation className="min-h-0 flex-1 overflow-y-auto">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              title="Start conversation"
              description="Chat with Platform AI Agent (Cloudflare Workers AI)"
              icon={
                <MessageSquare className="size-12 text-muted-foreground/50" />
              }
            />
          ) : (
            visibleMessages.map((message: UIMessage, msgIndex: number) => (
              <Message
                key={message.id}
                from={message.role}
                className="relative"
              >
                <MessageContent
                  className={
                    message.role === "user"
                      ? "rounded-[12px] bg-secondary px-4 py-3"
                      : ""
                  }
                >
                  {(message.parts ?? []).map((part, i) => {
                    if (part.type === "text") {
                      const displayText =
                        message.role === "assistant"
                          ? stripReasoningFromAssistantText(part.text)
                          : part.text;
                      return (
                        <MessageResponse key={`${message.id}-${i}`}>
                          {displayText}
                        </MessageResponse>
                      );
                    }
                    if (part.type === "file" && "url" in part) {
                      const data = {
                        ...part,
                        id: `${message.id}-file-${i}`,
                      };
                      return (
                        <MessageAttachments key={`${message.id}-${i}`}>
                          <Attachments variant="inline" className="mt-1">
                            <Attachment data={data}>
                              <AttachmentPreview />
                              <AttachmentInfo />
                            </Attachment>
                          </Attachments>
                        </MessageAttachments>
                      );
                    }
                    if (
                      typeof part.type === "string" &&
                      part.type.startsWith("tool-")
                    ) {
                      const toolPart = part as {
                        type: string;
                        toolCallId: string;
                        state: string;
                        input?: unknown;
                        output?: unknown;
                        errorText?: string;
                        approval?: { id?: string };
                      };
                      const toolState = toolPart.state as
                        | "approval-requested"
                        | "approval-responded"
                        | "input-available"
                        | "input-streaming"
                        | "output-available"
                        | "output-denied"
                        | "output-error";

                      // Image tool: show status — generating / success (image) / failed
                      if (isImageTool(toolPart.type)) {
                        if (isToolPending(toolPart.state)) {
                          return (
                            <div
                              key={`${message.id}-${i}`}
                              className="mt-2 flex items-center gap-2 rounded-lg border border-dashed bg-muted/40 px-3 py-4 text-sm text-muted-foreground"
                            >
                              <Loader2 className="size-5 shrink-0 animate-spin" />
                              <span>กำลังสร้างภาพ...</span>
                            </div>
                          );
                        }
                        if (toolPart.state === "output-error") {
                          return (
                            <div
                              key={`${message.id}-${i}`}
                              className="mt-2 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-4 text-sm text-destructive"
                            >
                              <AlertCircle className="size-5 shrink-0" />
                              <div className="flex min-w-0 flex-col gap-0.5">
                                <span className="font-medium">
                                  สร้างภาพไม่สำเร็จ
                                </span>
                                {toolPart.errorText && (
                                  <span className="text-xs opacity-90">
                                    {toolPart.errorText}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        }
                        if (toolPart.state === "output-available") {
                          const imageUrl = getImageUrlFromToolOutput(
                            toolPart.output,
                          );
                          const promptText =
                            toolPart.input &&
                            typeof toolPart.input === "object" &&
                            "prompt" in toolPart.input &&
                            typeof (toolPart.input as { prompt?: string })
                              .prompt === "string"
                              ? (toolPart.input as { prompt: string }).prompt
                              : null;
                          if (imageUrl) {
                            return (
                              <GeneratedImageCard
                                key={`${message.id}-${i}`}
                                imageUrl={imageUrl}
                                alt={promptText ?? "Generated"}
                              />
                            );
                          }
                          return (
                            <div
                              key={`${message.id}-${i}`}
                              className="mt-2 flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-3 text-sm text-muted-foreground"
                            >
                              <ImageIcon className="size-4 shrink-0" />
                              <span>สร้างภาพเสร็จแล้ว</span>
                            </div>
                          );
                        }
                        if (toolPart.state === "approval-requested") {
                          const approvalId =
                            toolPart.approval?.id ?? toolPart.toolCallId;
                          if (!approvalId) return null;
                          return (
                            <div
                              key={`${message.id}-${i}`}
                              className="mt-2 w-full"
                            >
                              <Tool defaultOpen>
                                <ToolHeader
                                  state={toolState}
                                  type={toolPart.type as `tool-${string}`}
                                />
                                <ToolContent>
                                  <Confirmation
                                    approval={{
                                      id: approvalId,
                                    }}
                                    state={toolState}
                                  >
                                    <ConfirmationRequest>
                                      <ConfirmationTitle>
                                        ต้องการอนุมัติการสร้างภาพหรือไม่?
                                      </ConfirmationTitle>
                                      <ConfirmationActions>
                                        <ConfirmationAction
                                          onClick={() =>
                                            addToolOutput({
                                              toolCallId: approvalId,
                                              output: { approved: true },
                                            })
                                          }
                                        >
                                          อนุมัติ
                                        </ConfirmationAction>
                                        <ConfirmationAction
                                          variant="outline"
                                          onClick={() =>
                                            addToolOutput({
                                              toolCallId: approvalId,
                                              output: { approved: false },
                                            })
                                          }
                                        >
                                          ปฏิเสธ
                                        </ConfirmationAction>
                                      </ConfirmationActions>
                                    </ConfirmationRequest>
                                  </Confirmation>
                                </ToolContent>
                              </Tool>
                            </div>
                          );
                        }
                        return null;
                      }

                      // Audio/voice tool: show status — generating / success (player) / failed
                      if (isAudioTool(toolPart.type)) {
                        if (isToolPending(toolPart.state)) {
                          return (
                            <div
                              key={`${message.id}-${i}`}
                              className="mt-2 flex items-center gap-2 rounded-lg border border-dashed bg-muted/40 px-3 py-4 text-sm text-muted-foreground"
                            >
                              <Loader2 className="size-5 shrink-0 animate-spin" />
                              <span>กำลังสร้างเสียง...</span>
                            </div>
                          );
                        }
                        if (toolPart.state === "output-error") {
                          return (
                            <div
                              key={`${message.id}-${i}`}
                              className="mt-2 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-4 text-sm text-destructive"
                            >
                              <AlertCircle className="size-5 shrink-0" />
                              <div className="flex min-w-0 flex-col gap-0.5">
                                <span className="font-medium">
                                  สร้างเสียงไม่สำเร็จ
                                </span>
                                {toolPart.errorText && (
                                  <span className="text-xs opacity-90">
                                    {toolPart.errorText}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        }
                        if (toolPart.state === "output-available") {
                          const audioUrl = getAudioUrlFromToolOutput(
                            toolPart.output,
                          );
                          if (audioUrl) {
                            return (
                              <GeneratedAudioCard
                                key={`${message.id}-${i}`}
                                audioUrl={audioUrl}
                              />
                            );
                          }
                          return (
                            <div
                              key={`${message.id}-${i}`}
                              className="mt-2 flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-3 text-sm text-muted-foreground"
                            >
                              <Music2Icon className="size-4 shrink-0" />
                              <span>สร้างเสียงเสร็จแล้ว</span>
                            </div>
                          );
                        }
                        if (toolPart.state === "approval-requested") {
                          const approvalId =
                            toolPart.approval?.id ?? toolPart.toolCallId;
                          if (!approvalId) return null;
                          return (
                            <div
                              key={`${message.id}-${i}`}
                              className="mt-2 w-full"
                            >
                              <Tool defaultOpen>
                                <ToolHeader
                                  state={toolState}
                                  type={toolPart.type as `tool-${string}`}
                                />
                                <ToolContent>
                                  <Confirmation
                                    approval={{
                                      id: approvalId,
                                    }}
                                    state={toolState}
                                  >
                                    <ConfirmationRequest>
                                      <ConfirmationTitle>
                                        ต้องการอนุมัติการสร้างเสียงหรือไม่?
                                      </ConfirmationTitle>
                                      <ConfirmationActions>
                                        <ConfirmationAction
                                          onClick={() =>
                                            addToolOutput({
                                              toolCallId: approvalId,
                                              output: { approved: true },
                                            })
                                          }
                                        >
                                          อนุมัติ
                                        </ConfirmationAction>
                                        <ConfirmationAction
                                          variant="outline"
                                          onClick={() =>
                                            addToolOutput({
                                              toolCallId: approvalId,
                                              output: { approved: false },
                                            })
                                          }
                                        >
                                          ปฏิเสธ
                                        </ConfirmationAction>
                                      </ConfirmationActions>
                                    </ConfirmationRequest>
                                  </Confirmation>
                                </ToolContent>
                              </Tool>
                            </div>
                          );
                        }
                        return null;
                      }

                      // Other tools: hide when no approval needed
                      if (toolPart.state !== "approval-requested") {
                        return null;
                      }
                      return (
                        <div key={`${message.id}-${i}`} className="mt-2 w-full">
                          <Tool defaultOpen>
                            <ToolHeader
                              state={toolState}
                              type={toolPart.type as `tool-${string}`}
                            />
                            <ToolContent>
                              {toolPart.state === "approval-requested" && (
                                (() => {
                                  const approvalId =
                                    toolPart.approval?.id ??
                                    toolPart.toolCallId;
                                  if (!approvalId) return null;
                                  return (
                                <Confirmation
                                  approval={{
                                    id: approvalId,
                                  }}
                                  state={toolState}
                                >
                                  <ConfirmationRequest>
                                    <ConfirmationTitle>
                                      ต้องการอนุมัติการเรียกใช้ tool นี้หรือไม่?
                                    </ConfirmationTitle>
                                    <ConfirmationActions>
                                      <ConfirmationAction
                                        onClick={() =>
                                          addToolOutput({
                                            toolCallId: approvalId,
                                            output: { approved: true },
                                          })
                                        }
                                      >
                                        อนุมัติ
                                      </ConfirmationAction>
                                      <ConfirmationAction
                                        variant="outline"
                                        onClick={() =>
                                          addToolOutput({
                                            toolCallId: approvalId,
                                            output: { approved: false },
                                          })
                                        }
                                      >
                                        ปฏิเสธ
                                      </ConfirmationAction>
                                    </ConfirmationActions>
                                  </ConfirmationRequest>
                                </Confirmation>
                                  );
                                })()
                              )}
                              {toolPart.input != null && (
                                <ToolInput input={toolPart.input} />
                              )}
                              {(toolPart.output != null ||
                                toolPart.errorText != null) && (
                                <ToolOutput
                                  errorText={toolPart.errorText}
                                  output={toolPart.output}
                                />
                              )}
                            </ToolContent>
                          </Tool>
                        </div>
                      );
                    }
                    return null;
                  })}
                </MessageContent>
                {message.role === "assistant" &&
                  msgIndex === visibleMessages.length - 1 &&
                  status === "ready" &&
                  !dismissedTruncatedIds.has(message.id) &&
                  (() => {
                    const raw = getFullTextFromMessage(message);
                    const display = stripReasoningFromAssistantText(raw);
                    return looksTruncated(display);
                  })() && (
                    <div className="mt-3">
                      <Alert
                        variant="warning"
                        appearance="light"
                        size="sm"
                        className="rounded-lg"
                      >
                        <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <span>
                            การตอบกลับอาจไม่ครบถ้วน เกิดปัญหาชั่วคราวกับระบบ
                          </span>
                          <div className="flex shrink-0 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const msgs = messages as UIMessage[];
                                const textToResend = (() => {
                                  const lastUserIdx = [...msgs]
                                    .reverse()
                                    .findIndex(
                                      (m: UIMessage) => m.role === "user",
                                    );
                                  const idx =
                                    lastUserIdx >= 0
                                      ? msgs.length - 1 - lastUserIdx
                                      : -1;
                                  if (idx < 0) return "";
                                  const userMsg = msgs[idx];
                                  if (!userMsg) return "";
                                  const parts =
                                    userMsg.parts?.filter(
                                      (p: {
                                        type: string;
                                      }): p is { type: "text"; text: string } =>
                                        p.type === "text",
                                    ) ?? [];
                                  return parts.map((p) => p.text).join(" ");
                                })();
                                if (textToResend.trim()) {
                                  setMessages(
                                    msgs.slice(0, -1) as typeof messages,
                                  );
                                  setTimeout(() => {
                                    sendMessage({
                                      role: "user",
                                      parts: [
                                        {
                                          type: "text",
                                          text: textToResend.trim(),
                                        },
                                      ],
                                    } as unknown as Parameters<
                                      typeof sendMessage
                                    >[0]);
                                  }, 0);
                                }
                              }}
                            >
                              ลองถามใหม่
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setDismissedTruncatedIds((prev) => {
                                  const next = new Set(prev);
                                  next.add(message.id);
                                  return next;
                                })
                              }
                            >
                              ปิด
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                <MessageActions className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <MessageAction
                    label="Copy"
                    tooltip="Copy"
                    onClick={() => {
                      const text = getTextFromMessage(message);
                      void navigator.clipboard?.writeText(text);
                    }}
                  >
                    <Copy className="size-3.5" />
                  </MessageAction>
                  {message.role === "assistant" &&
                    msgIndex === visibleMessages.length - 1 && (
                      <MessageAction
                        label="Regenerate"
                        tooltip="Regenerate"
                        onClick={() => {
                          const msgs = messages as UIMessage[];
                          const textToResend = (() => {
                            const lastUserIdx = [...msgs]
                              .reverse()
                              .findIndex((m: UIMessage) => m.role === "user");
                            const idx =
                              lastUserIdx >= 0
                                ? msgs.length - 1 - lastUserIdx
                                : -1;
                            if (idx < 0) return "";
                            const userMsg = msgs[idx];
                            if (!userMsg) return "";
                            const parts =
                              userMsg.parts?.filter(
                                (p: {
                                  type: string;
                                }): p is { type: "text"; text: string } =>
                                  p.type === "text",
                              ) ?? [];
                            return parts.map((p) => p.text).join(" ");
                          })();
                          if (textToResend.trim()) {
                            setMessages(msgs.slice(0, -1) as typeof messages);
                            setTimeout(() => {
                              sendMessage({
                                role: "user",
                                parts: [
                                  { type: "text", text: textToResend.trim() },
                                ],
                              } as unknown as Parameters<
                                typeof sendMessage
                              >[0]);
                            }, 0);
                          }
                        }}
                      >
                        <RotateCw className="size-3.5" />
                      </MessageAction>
                    )}
                </MessageActions>
              </Message>
            ))
          )}
          {pendingAssistantResponse && (
            <Message from="assistant">
              <MessageContent>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="inline-block size-2 animate-pulse rounded-full bg-current" />
                  <span className="text-sm">
                    {status === "submitted" ? "Connecting..." : "Thinking..."}
                  </span>
                </div>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="sticky bottom-0 z-10 shrink-0 border-t bg-background p-4">
        {chatErrorMessage && !dismissedChatError && (
          <Alert
            variant="destructive"
            appearance="light"
            size="sm"
            className="mb-3 rounded-lg"
          >
            <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span>{chatErrorMessage}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDismissedChatError(false);
                    const msgs = messages as UIMessage[];
                    const lastUser = [...msgs]
                      .reverse()
                      .find((m: UIMessage) => m.role === "user");
                    if (!lastUser) return;
                    const textToResend =
                      getFullTextFromMessage(lastUser).trim();
                    if (!textToResend) return;
                    sendMessage({
                      role: "user",
                      parts: [{ type: "text", text: textToResend }],
                    } as unknown as Parameters<typeof sendMessage>[0]);
                  }}
                >
                  ลองใหม่
                </Button>
                <Button variant="primary" size="sm" onClick={handleNewChat}>
                  New chat
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        <div className="mb-3 rounded-lg border bg-muted/20 p-2">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/50"
            onClick={() => setGuideOpen((prev) => !prev)}
            aria-expanded={guideOpen}
          >
            <Lightbulb className="size-4 text-amber-500" />
            <span className="font-medium text-foreground">Tips for best results</span>
            <ChevronDown
              className={cn(
                "ml-auto size-4 transition-transform",
                guideOpen && "rotate-180",
              )}
            />
          </button>
          {guideOpen && (
            <ul className="mt-2 list-inside list-disc space-y-1 px-2 text-sm text-muted-foreground">
              {guideContent.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          )}
          <div className="mt-2 flex flex-wrap gap-2 px-1 pb-1">
            {guideContent.suggestions.map((suggestion) => (
              <Button
                key={suggestion}
                type="button"
                variant="outline"
                size="sm"
                className="h-7 rounded-full text-xs"
                disabled={!canSend}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
        <PromptInput
          className="rounded-2xl"
          onSubmit={(payload) => {
            setDismissedChatError(false);
            handleSubmit(payload);
          }}
          multiple
          accept="image/*,.pdf,.txt,.md,.json,.csv"
          maxFiles={5}
          maxFileSize={10 * 1024 * 1024}
        >
          <PromptInputTextarea
            className="min-h-20 px-4 py-3 text-base"
            placeholder="Type a question or task... (⌘↵ to send)"
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                const form = e.currentTarget.form;
                const submitBtn = form?.querySelector(
                  'button[type="submit"]',
                ) as HTMLButtonElement | null;
                if (!submitBtn?.disabled) form?.requestSubmit();
              }
            }}
          />
          <InputAttachmentStrip />
          <PromptInputFooter className="justify-between gap-2 p-2">
            <PromptInputTools className="gap-1">
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger
                  tooltip="แนบไฟล์"
                  className="shrink-0"
                >
                  <Paperclip className="size-4" />
                </PromptInputActionMenuTrigger>
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments label="แนบรูปหรือไฟล์" />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <ModelSelector open={selectorOpen} onOpenChange={setSelectorOpen}>
                <ModelSelectorTrigger className="h-9 w-auto min-w-[140px] px-3">
                  <span className="truncate">
                    {chatAgents.find((a) => a.id === selectedAgentId)?.name ??
                      "เลือก Agent"}
                  </span>
                  <ChevronsUpDown className="ml-1.5 size-3.5 shrink-0 opacity-50" />
                </ModelSelectorTrigger>
                <ModelSelectorContent title="เลือก Agent">
                  <ModelSelectorInput />
                  <ModelSelectorList>
                    <ModelSelectorEmpty />
                    <ModelSelectorGroup>
                      {chatAgents.map((a) => (
                        <ModelSelectorItem
                          key={a.id}
                          selected={a.id === selectedAgentId}
                          value={`${a.name} ${a.id} ${a.description ?? ""}`}
                          onSelect={() => {
                            onAgentChange?.(a.id);
                            setSelectorOpen(false);
                          }}
                        >
                          <div className="flex min-w-0 flex-col">
                            <span>{a.name}</span>
                            {a.description && (
                              <span className="text-xs text-muted-foreground">
                                {a.description}
                              </span>
                            )}
                          </div>
                        </ModelSelectorItem>
                      ))}
                    </ModelSelectorGroup>
                  </ModelSelectorList>
                  {onManageSheetOpenChange && (
                    <div className="border-t p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2"
                        onClick={() => {
                          setSelectorOpen(false);
                          onManageSheetOpenChange(true);
                        }}
                      >
                        <Settings2 className="size-4" />
                        จัดการ Agents
                      </Button>
                    </div>
                  )}
                </ModelSelectorContent>
              </ModelSelector>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9"
                onClick={handleToggleListening}
                title={
                  isListening ? "หยุดบันทึกเสียง" : "เริ่มพิมพ์ด้วยเสียง"
                }
              >
                {isListening ? (
                  <Square className="size-4 text-red-500" />
                ) : (
                  <Mic className="size-4" />
                )}
              </Button>
            </PromptInputTools>
            <PromptInputSubmit
              disabled={!canSend}
              status={status === "streaming" ? "streaming" : undefined}
              variant="primary"
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}

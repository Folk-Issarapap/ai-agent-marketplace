"use client";

import {
  Confirmation,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationAccepted,
  ConfirmationRejected,
  ConfirmationRequest,
  ConfirmationTitle,
} from "@/components/ai-elements/confirmation";
import { MessageResponse } from "@/components/ai-elements/message";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import type { ToolPart as ToolPartType } from "@/components/ai-elements/tool";
import type { ReactNode } from "react";
import { CheckIcon, XIcon } from "lucide-react";

/** Tool part state from AI SDK */
export type ToolPartState = string;

export type ToolPartLike = {
  type: string;
  toolCallId?: string;
  toolName?: string;
  state?: ToolPartState;
  input?: unknown;
  output?: unknown;
  errorText?: string;
  approval?: { id: string };
};

function getToolNameFromPart(part: ToolPartLike): string {
  if (part.type === "dynamic-tool" && part.toolName) return part.toolName;
  if (part.type.startsWith("tool-")) return part.type.replace(/^tool-/, "");
  return "Tool";
}

function isImageTool(name: string): boolean {
  const t = name.toLowerCase();
  return t.includes("image") || t.includes("generateimage");
}

function isAudioTool(name: string): boolean {
  const t = name.toLowerCase();
  return (
    t.includes("audio") ||
    t.includes("voice") ||
    t.includes("speech") ||
    t.includes("tts") ||
    t.includes("texttospeech")
  );
}

function getImageBase64(parsed: Record<string, unknown>): string | null {
  const v =
    parsed.imageBase64 ??
    parsed.image_base64 ??
    (parsed.data && typeof parsed.data === "object" && !Array.isArray(parsed.data)
      ? (parsed.data as Record<string, unknown>).imageBase64 ??
        (parsed.data as Record<string, unknown>).image_base64
      : undefined) ??
    (parsed.result && typeof parsed.result === "object" && !Array.isArray(parsed.result)
      ? (parsed.result as Record<string, unknown>).imageBase64 ??
        (parsed.result as Record<string, unknown>).image_base64
      : undefined) ??
    parsed.base64;
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function getAudioBase64(parsed: Record<string, unknown>): string | null {
  const v =
    parsed.audio ??
    parsed.audio_base64 ??
    parsed.content ??
    (parsed.data && typeof parsed.data === "object" && !Array.isArray(parsed.data)
      ? (parsed.data as Record<string, unknown>).audio ??
        (parsed.data as Record<string, unknown>).audio_base64 ??
        (parsed.data as Record<string, unknown>).base64
      : undefined) ??
    (parsed.result && typeof parsed.result === "object" && !Array.isArray(parsed.result)
      ? (parsed.result as Record<string, unknown>).audio ??
        (parsed.result as Record<string, unknown>).audio_base64 ??
        (parsed.result as Record<string, unknown>).base64
      : undefined) ??
    parsed.base64;
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function ToolOutputDisplay({
  name,
  output,
}: {
  name: string;
  output: unknown;
}) {
  const result =
    typeof output === "string"
      ? output
      : output !== undefined && output !== null
        ? JSON.stringify(output)
        : "";
  if (!result) return null;

  let parsed: Record<string, unknown> & {
    mimeType?: string;
    prompt?: string;
    error?: string;
    text?: string;
    languageFallback?: string;
  };
  try {
    parsed = JSON.parse(result) as typeof parsed;
  } catch {
    return (
      <div className="mt-2 rounded border bg-muted/50 p-2 text-xs font-mono">
        <span className="font-medium">{name}</span>
        <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap text-muted-foreground">
          {result}
        </pre>
      </div>
    );
  }

  const imageB64 = getImageBase64(parsed);
  if (isImageTool(name) && imageB64 && !parsed.error) {
    const mime = (parsed.mimeType as string) ?? "image/png";
    return (
      <div className="mt-2 rounded border overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:${mime};base64,${imageB64}`}
          alt={(parsed.prompt as string) ?? "Generated image"}
          className="max-w-full h-auto block"
        />
      </div>
    );
  }

  const audioB64 = getAudioBase64(parsed);
  if (isAudioTool(name) && audioB64 && !parsed.error) {
    const mime = (parsed.mimeType as string) ?? "audio/mpeg";
    return (
      <div className="mt-2 rounded border bg-muted/30 p-2">
        {parsed.languageFallback && (
          <p className="mb-1 text-xs text-amber-600 dark:text-amber-400">
            {String(parsed.languageFallback)}
          </p>
        )}
        {parsed.text && (
          <p className="mb-1 text-sm text-muted-foreground">
            &quot;{String(parsed.text)}&quot;
          </p>
        )}
        <audio
          controls
          src={`data:${mime};base64,${audioB64}`}
          className="w-full max-w-sm"
        />
      </div>
    );
  }

  return (
    <div className="mt-2 rounded border bg-muted/50 p-2 text-xs font-mono">
      <span className="font-medium">{name}</span>
      <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap text-muted-foreground">
        {result}
      </pre>
    </div>
  );
}

export function ToolPartBlock({
  part,
  addToolApprovalResponse,
}: {
  part: ToolPartLike;
  addToolApprovalResponse?: (arg: { id: string; approved: boolean }) => void;
}) {
  const toolName = getToolNameFromPart(part);
  const key = part.toolCallId ?? toolName;
  const state = part.state ?? "input-streaming";

  const toolState = state as ToolPartType["state"];
  const headerProps =
    part.type === "dynamic-tool"
      ? {
          type: part.type as "dynamic-tool",
          state: toolState,
          toolName: toolName,
        }
      : { type: part.type as `tool-${string}`, state: toolState };

  switch (state) {
    case "input-streaming":
      return (
        <Tool key={key} defaultOpen={false}>
          <ToolHeader {...headerProps} />
          <ToolContent>
            {part.input != null && <ToolInput input={part.input} />}
          </ToolContent>
        </Tool>
      );
    case "input-available":
      return (
        <Tool key={key} defaultOpen={true}>
          <ToolHeader {...headerProps} />
          <ToolContent>
            {part.input != null && <ToolInput input={part.input} />}
          </ToolContent>
        </Tool>
      );
    case "approval-requested":
    case "approval-responded":
    case "output-denied":
      if (!part.approval) return null;
      return (
        <div key={key} className="mt-2">
          <Confirmation approval={part.approval} state={state}>
            <ConfirmationTitle>
              <ConfirmationRequest>
                <span className="font-medium">{toolName}</span> — Do you approve
                this action?
                {part.input != null && (
                  <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
                    {typeof part.input === "object" && part.input !== null
                      ? JSON.stringify(part.input, null, 2)
                      : String(part.input)}
                  </pre>
                )}
              </ConfirmationRequest>
              <ConfirmationAccepted>
                <span className="inline-flex items-center gap-1.5">
                  <CheckIcon className="size-4" />
                  You approved this tool execution
                </span>
              </ConfirmationAccepted>
              <ConfirmationRejected>
                <span className="inline-flex items-center gap-1.5">
                  <XIcon className="size-4" />
                  You rejected this tool execution
                </span>
              </ConfirmationRejected>
            </ConfirmationTitle>
            <ConfirmationActions>
              <ConfirmationAction
                variant="outline"
                onClick={() =>
                  addToolApprovalResponse?.({
                    id: part.approval!.id,
                    approved: false,
                  })
                }
              >
                Reject
              </ConfirmationAction>
              <ConfirmationAction
                variant="primary"
                onClick={() =>
                  addToolApprovalResponse?.({
                    id: part.approval!.id,
                    approved: true,
                  })
                }
              >
                Approve
              </ConfirmationAction>
            </ConfirmationActions>
          </Confirmation>
        </div>
      );
    case "output-available":
      // For media tools (image/audio), render inline like web_boat/boat chatbot
      if (isImageTool(toolName) || isAudioTool(toolName)) {
        return (
          <div key={key} className="mt-2">
            <ToolOutputDisplay name={toolName} output={part.output} />
          </div>
        );
      }
      return (
        <Tool key={key} defaultOpen={true}>
          <ToolHeader {...headerProps} />
          <ToolContent>
            {part.input != null && <ToolInput input={part.input} />}
            <ToolOutput
              output={
                <ToolOutputDisplay
                  name={toolName}
                  output={part.output}
                /> as ReactNode
              }
              errorText={undefined}
            />
          </ToolContent>
        </Tool>
      );
    case "output-error":
      return (
        <Tool key={key} defaultOpen={true}>
          <ToolHeader {...headerProps} />
          <ToolContent>
            {part.input != null && <ToolInput input={part.input} />}
            <ToolOutput
              output={null}
              errorText={part.errorText ?? "Error"}
            />
          </ToolContent>
        </Tool>
      );
    default:
      return (
        <Tool
          key={key}
          defaultOpen={
            state === "output-available" || state === "output-error"
          }
        >
          <ToolHeader {...headerProps} />
          <ToolContent>
            {part.input != null && <ToolInput input={part.input} />}
            {(part.output != null || part.errorText != null) && (
              <ToolOutput
                output={part.output as ReactNode}
                errorText={part.errorText}
              />
            )}
          </ToolContent>
        </Tool>
      );
  }
}

export function MessageParts({
  parts,
  addToolApprovalResponse,
}: {
  parts: Array<{ type: string; text?: string } & ToolPartLike>;
  addToolApprovalResponse?: (arg: { id: string; approved: boolean }) => void;
}) {
  return (
    <>
      {parts?.map((part, index) => {
        if (part.type === "text") {
          const text = part.text ?? "";
          if (!text) return null;
          return <MessageResponse key={`text-${index}`}>{text}</MessageResponse>;
        }
        if (part.type === "dynamic-tool" || part.type.startsWith("tool-")) {
          return (
            <ToolPartBlock
              key={part.toolCallId ?? `tool-${index}`}
              part={part as ToolPartLike}
              addToolApprovalResponse={addToolApprovalResponse}
            />
          );
        }
        if (part.type === "step-start") {
          return index > 0 ? (
            <hr
              key={`step-${index}`}
              className="my-2 border-border"
              aria-hidden
            />
          ) : null;
        }
        // Inline image/audio parts (e.g. from Cloudflare agents)
        const partAny = part as Record<string, unknown>;
        if (part.type === "image") {
          const src =
            typeof partAny.src === "string"
              ? partAny.src
              : typeof partAny.image === "string"
                ? partAny.image
                : typeof partAny.data === "string"
                  ? partAny.data
                  : null;
          if (src) {
            return (
              <div key={`image-${index}`} className="mt-2 rounded border overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src.startsWith("data:") ? src : `data:image/png;base64,${src}`}
                  alt="Generated"
                  className="max-w-full h-auto block"
                />
              </div>
            );
          }
        }
        if (part.type === "audio") {
          const src =
            typeof partAny.src === "string"
              ? partAny.src
              : typeof partAny.audio === "string"
                ? partAny.audio
                : typeof partAny.data === "string"
                  ? partAny.data
                  : null;
          if (src) {
            const dataUrl = src.startsWith("data:") ? src : `data:audio/mpeg;base64,${src}`;
            return (
              <div key={`audio-${index}`} className="mt-2 rounded border bg-muted/30 p-2">
                <audio controls src={dataUrl} className="w-full max-w-sm" />
              </div>
            );
          }
        }
        return null;
      })}
    </>
  );
}

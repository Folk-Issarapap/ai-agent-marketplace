# คู่มือการนำ Cloudflare Agent ไปใช้งานกับโปรเจกต์อื่น ๆ

คู่มือนี้สรุปรูปแบบการใช้งาน Agent จาก boat-ai-agent-app สำหรับนำไปประยุกต์ใช้กับโปรเจกต์อื่น ๆ รวมถึงการติดตั้ง dependencies, logic การเชื่อมต่อ และรายละเอียดที่ควรทราบ

---

## สารบัญ

1. [ภาพรวมสถาปัตยกรรม](#1-ภาพรวมสถาปัตยกรรม)
2. [การติดตั้ง Dependencies](#2-การติดตั้ง-dependencies)
3. [Server-Side: สร้าง Agent บน Cloudflare Workers](#3-server-side-สร้าง-agent-บน-cloudflare-workers)
4. [Client-Side: การเชื่อมต่อจาก Frontend](#4-client-side-การเชื่อมต่อจาก-frontend)
5. [รูปแบบการเชื่อมต่อ Remote Agent (Multi-Host)](#5-รูปแบบการเชื่อมต่อ-remote-agent-multi-host)
6. [การจัดการ Client-Side Tools](#6-การจัดการ-client-side-tools)
7. [รูปแบบข้อความ (Message Format)](#7-รูปแบบข้อความ-message-format)
8. [Docs และแหล่งอ้างอิง](#8-docs-และแหล่งอ้างอิง)
9. [ข้อควรระวังและ Best Practices](#9-ข้อควรระวังและ-best-practices)
10. [Checklist สำหรับโปรเจกต์ใหม่](#10-checklist-สำหรับโปรเจกต์ใหม่)

---

## 1. ภาพรวมสถาปัตยกรรม

```
┌─────────────────────────────────────────────────────────────────────┐
│  Frontend (Next.js, React, etc.)                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ useAgent({ agent: "ChatAgent", host: agentUrl })              │  │
│  │ useAgentChat({ agent, body, onToolCall })                     │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              │ WebSocket (CF_AGENT_USE_CHAT_REQUEST) │
└──────────────────────────────┼─────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Cloudflare Worker + Durable Objects (Agent Host)                    │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ AIChatAgent extends ...                                       │  │
│  │   - onChatMessage() → streamText() → Workers AI / OpenAI       │  │
│  │   - SQLite (message persistence)                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

**จุดสำคัญ:**
- Frontend ใช้ `useAgent` + `useAgentChat` เพื่อเชื่อมต่อ Agent ผ่าน WebSocket
- Agent รันบน **Cloudflare Workers** และใช้ Durable Objects สำหรับ state
- แต่ละ Agent มี **host URL** ที่ชี้ไปยัง Worker endpoint (เช่น `https://my-agent.workers.dev`)

---

## 2. การติดตั้ง Dependencies

### Frontend (React/Next.js)

```bash
npm install @cloudflare/ai-chat agents ai
# หรือ
pnpm add @cloudflare/ai-chat agents ai
```

**เวอร์ชันที่ใช้ในโปรเจกต์ต้นแบบ:**
- `@cloudflare/ai-chat`: ^0.1.2
- `agents`: ^0.5.0
- `ai`: ^6.0.94

### Server (Cloudflare Worker)

```bash
npm install @cloudflare/ai-chat agents ai workers-ai-provider zod
# หรือใช้ create cloudflare
npm create cloudflare@latest my-chat-agent
cd my-chat-agent
npm install agents @cloudflare/ai-chat ai workers-ai-provider zod
```

---

## 3. Server-Side: สร้าง Agent บน Cloudflare Workers

### 3.1 Wrangler Configuration

ไฟล์ `wrangler.jsonc` หรือ `wrangler.toml`:

```jsonc
// wrangler.jsonc
{
  "name": "my-chat-agent",
  "main": "src/server.ts",
  "compatibility_date": "2026-02-22",
  "compatibility_flags": ["nodejs_compat"],
  "ai": { "binding": "AI" },
  "durable_objects": {
    "bindings": [{ "name": "ChatAgent", "class_name": "ChatAgent" }]
  },
  "migrations": [{ "tag": "v1", "new_sqlite_classes": ["ChatAgent"] }]
}
```

**สำคัญ:** `new_sqlite_classes` จำเป็นสำหรับ message persistence และ stream buffering

### 3.2 Server Code

```ts
// src/server.ts
import { AIChatAgent } from "@cloudflare/ai-chat";
import { routeAgentRequest } from "agents";
import { createWorkersAI } from "workers-ai-provider";
import { streamText, convertToModelMessages, pruneMessages } from "ai";

export class ChatAgent extends AIChatAgent {
  async onChatMessage(_onFinish, options) {
    const workersai = createWorkersAI({ binding: this.env.AI });
    const { model } = options?.body ?? {};

    const result = streamText({
      model: workersai(model ?? "@cf/zai-org/glm-4.7-flash"),
      system: "You are a helpful assistant.",
      messages: pruneMessages({
        messages: await convertToModelMessages(this.messages),
        toolCalls: "before-last-2-messages",
      }),
      abortSignal: options?.abortSignal,
    });

    return result.toUIMessageStreamResponse();
  }
}

export default {
  async fetch(request: Request, env: Env) {
    return (
      (await routeAgentRequest(request, env)) ||
      new Response("Not found", { status: 404 })
    );
  },
} satisfies ExportedHandler<Env>;
```

### 3.3 Deploy

```bash
npx wrangler deploy
```

หลัง deploy จะได้ URL เช่น `https://my-chat-agent.your-subdomain.workers.dev` — นี่คือ **host** ที่ใช้ใน client

---

## 4. Client-Side: การเชื่อมต่อจาก Frontend

### 4.1 Imports

```tsx
import { useAgent } from "agents/react";
import { useAgentChat } from "@cloudflare/ai-chat/react";
```

### 4.2 การใช้งานพื้นฐาน (Single Agent)

```tsx
"use client";

function Chat() {
  const agent = useAgent({
    agent: "ChatAgent",
    host: "https://my-chat-agent.your-subdomain.workers.dev",
  });

  const { messages, sendMessage, status } = useAgentChat({
    agent,
  });

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.id}>
          <strong>{msg.role}:</strong>
          {msg.parts?.map((part, i) =>
            part.type === "text" ? <span key={i}>{part.text}</span> : null
          )}
        </div>
      ))}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const input = e.currentTarget.elements.namedItem("input") as HTMLInputElement;
          sendMessage({ role: "user", parts: [{ type: "text", text: input.value }] });
          input.value = "";
        }}
      >
        <input name="input" placeholder="Type..." />
        <button type="submit" disabled={status === "streaming"}>Send</button>
      </form>
    </div>
  );
}
```

### 4.3 ส่ง Custom Body (เช่น Model ID)

```tsx
const effectiveModelId = "@cf/zai-org/glm-4.7-flash";

const { messages, sendMessage, status } = useAgentChat({
  agent,
  body: () => (effectiveModelId ? { model: effectiveModelId } : {}),
  getInitialMessages: null, // ไม่ fetch initial messages
});
```

---

## 5. รูปแบบการเชื่อมต่อ Remote Agent (Multi-Host)

เมื่อมีหลาย Agent แต่ละตัว host บน URL คนละที่ (เช่น boat-ai-agent-app)

### 5.1 โครงสร้างข้อมูล Agent

```ts
type AgentItem = {
  id: string;
  name: string;
  host: string;  // URL ของ Worker — ดูรายละเอียดรูปแบบด้านล่าง
  allowedModels?: string[] | null;
  defaultModel?: string | null;
};
```

### 5.1.1 รูปแบบ host URL

| รูปแบบ | ตัวอย่าง | หมายเหตุ |
|--------|----------|----------|
| **Origin เท่านั้น** (แนะนำ) | `https://boat-ai-agent-2.example.workers.dev` | ใช้แค่ domain ของ Worker ไม่มี path ต่อท้าย |
| มี trailing slash | `https://boat-ai-agent-2.example.workers.dev/` | ใช้ได้เช่นกัน |
| มี path (กรณี Worker deploy ที่ sub-path) | `https://agents-starter.example.workers.dev/agents/chat-agent` | ใช้เมื่อ Worker ถูก deploy ให้ serve ที่ path เฉพาะ |

**SDK จะต่อ path ให้เอง:**

เมื่อใช้ `useAgent({ agent: "ChatAgent", host, name: "admin" })` และ `useAgentChat`, Client SDK จะเรียก endpoints ดังนี้:

| Endpoint | URL ที่ได้ | ใช้เมื่อ |
|----------|------------|----------|
| get-messages | `{host}/agents/chat-agent/{name}/get-messages` | โหลดประวัติแชทเริ่มต้น (ถ้าไม่ใช้ `getInitialMessages: null`) |
| chat (stream) | `{host}/agents/chat-agent/{name}/chat` | ส่งข้อความและรับ stream |

**ตัวอย่าง:**

- `host = "https://boat-ai-agent-2.example.workers.dev"`  
  → get-messages: `https://boat-ai-agent-2.example.workers.dev/agents/chat-agent/admin/get-messages`

- `host = "https://agents-starter.example.workers.dev/agents/chat-agent"`  
  → get-messages: `https://agents-starter.example.workers.dev/agents/chat-agent/admin/get-messages`

### 5.2 ใช้ host ตาม Agent ที่เลือก

```tsx
function ChatWithAgentSelector({ agents, selectedAgentId }: Props) {
  const selectedAgent = agents.find((a) => a.id === selectedAgentId);

  const agent = useAgent({
    agent: "ChatAgent",
    host: selectedAgent?.host ?? "",
  });

  const effectiveModelId =
    selectedAgent?.defaultModel ??
    selectedAgent?.allowedModels?.[0] ??
    "@cf/zai-org/glm-4.7-flash";

  const { messages, sendMessage, status } = useAgentChat({
    agent,
    body: () => (effectiveModelId ? { model: effectiveModelId } : {}),
    getInitialMessages: null,
  });

  // ...
}
```

**ข้อควรระวัง:**
- เมื่อเปลี่ยน `host` จะเกิดการ reconnect ใหม่
- ควรเช็ค `host` ก่อนส่งข้อความ (`if (!agent.host) return;`)

---

## 6. การจัดการ Client-Side Tools

บาง tools ให้ client (browser) execute แทน server เช่น `getUserTimezone`

### 6.1 Server: กำหนด Tool โดยไม่มี execute

```ts
// บน Worker
tools: {
  getUserTimezone: tool({
    description: "Get the user's timezone from their browser",
    inputSchema: z.object({}),
    // ไม่มี execute — client จะ handle
  }),
}
```

### 6.2 Client: onToolCall

```tsx
const { messages, sendMessage, status } = useAgentChat({
  agent,
  body: () => (effectiveModelId ? { model: effectiveModelId } : {}),
  getInitialMessages: null,
  onToolCall: async (event) => {
    if ("addToolOutput" in event && event.toolCall.toolName === "getUserTimezone") {
      event.addToolOutput?.({
        toolCallId: event.toolCall.toolCallId,
        output: {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          localTime: new Date().toLocaleTimeString(),
        },
      });
    }
  },
});
```

---

## 7. รูปแบบข้อความ (Message Format)

### 7.1 UIMessage (จาก useAgentChat)

```ts
type UIMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  parts: Array<
    | { type: "text"; text: string }
    | { type: "tool"; toolName: string; toolCallId: string; state: string; args?: object; result?: unknown }
    // ...
  >;
};
```

### 7.2 การส่งข้อความ

```ts
sendMessage({
  role: "user",
  parts: [{ type: "text", text: "Hello" }],
});
```

### 7.3 การดึงข้อความจาก message

```ts
function getTextFromMessage(msg: UIMessage): string {
  const textParts =
    msg.parts?.filter(
      (p): p is { type: "text"; text: string } => p.type === "text"
    ) ?? [];
  return textParts.map((p) => p.text).join("");
}
```

---

## 8. Docs และแหล่งอ้างอิง

| หัวข้อ | URL |
|--------|-----|
| Chat Agents API Reference | https://developers.cloudflare.com/agents/api-reference/chat-agents/ |
| Build a Chat Agent (Getting Started) | https://developers.cloudflare.com/agents/getting-started/build-a-chat-agent/ |
| Client SDK (useAgent, AgentClient) | https://developers.cloudflare.com/agents/api-reference/client-sdk/ |
| npm: agents | https://www.npmjs.com/package/agents |
| npm: @cloudflare/ai-chat | https://www.npmjs.com/package/@cloudflare/ai-chat |
| AI SDK (Vercel) | https://ai-sdk.dev/ |

---

## 9. ข้อควรระวังและ Best Practices

### 9.1 CORS

- Worker ต้องตั้งค่า CORS ให้โดเมนของ frontend เรียกได้ (เช่น `Access-Control-Allow-Origin: http://localhost:3001` สำหรับ dev)
- **วิธีหลีกเลี่ยง CORS เมื่อ Worker ยังไม่มี CORS header:** ใช้ `getInitialMessages: null` หรือ `getInitialMessages: async () => []` ใน `useAgentChat` เพื่อไม่ให้ SDK เรียก `GET .../get-messages` (ซึ่งเป็น request แรกที่มักโดน CORS ก่อน) — การ chat ต่ออาจใช้ WebSocket หรือ stream endpoint ที่มี CORS ต่างกัน

### 9.2 abortSignal
- ส่ง `options?.abortSignal` ไปที่ `streamText()` เพื่อให้ user กด stop แล้วหยุด LLM call ได้

### 9.3 getInitialMessages และ Conversation Persistence
- ใช้ `getInitialMessages: null` หรือ `getInitialMessages: async () => []` หากไม่ต้องการโหลด messages เริ่มต้นจาก server — ช่วยลดโอกาสโดน CORS เมื่อ Worker ยังไม่ได้ตั้ง CORS headers
- **การเก็บประวัติหลัง refresh**: Messages ถูก persist ใน SQLite บน server อัตโนมัติ — ถ้าต้องการให้โหลดกลับหลัง refresh:
  - **อย่า** ใช้ `getInitialMessages: null` (ปล่อยให้ default โหลดจาก server)
  - ใช้ `name` ใน useAgent ให้คงที่ (เช่น `name: "admin"` หรือ `name: \`admin-${agentId}\`\)) เพื่อให้ได้ instance เดิม (ดู [Client SDK](https://developers.cloudflare.com/agents/api-reference/client-sdk/))

### 9.4 Host Validation
- ตรวจสอบ `host` ก่อนส่งข้อความ เพื่อหลีกเลี่ยง error เมื่อ agent ยังไม่ถูกเลือก

### 9.5 เวอร์ชัน Compatibility
- ใช้ `agents`, `@cloudflare/ai-chat`, `ai` ในเวอร์ชันที่ compatible กัน (ดูจาก package.json ของโปรเจกต์ต้นแบบ)

### 9.6 กรณีไม่ใช้ Cloudflare
- หาก backend ไม่ใช่ Cloudflare Workers ให้ใช้ **Vercel AI SDK** แทน (`useChat` + Route Handler / API route)

### 9.7 Image Agent: หนึ่งข้อความ = หนึ่งรูป (แนะนำ)
- ผู้ใช้ส่วนใหญ่คาดว่า **หนึ่ง prompt = หนึ่งรูป** เว้นแต่จะระบุชัดว่า "สร้าง 2 รูป" หรือ "รูปแรก... รูปที่สอง..."
- ถ้า user พิมพ์หลายประโยค (เช่น "A professional headshot... A person hiking in the forest...") แล้วได้หลายรูป อาจทำให้สับสน
- **แนะนำสำหรับ Image Agent (บน Worker):** ใส่ใน system instruction ว่าให้สร้าง **เพียง 1 รูปต่อ 1 user message** โดยใช้ข้อความทั้งหมดเป็น prompt เดียว (หรือเลือกประโยคหลัก) และให้สร้างหลายรูปเฉพาะเมื่อ user บอกชัด เช่น "generate 2 images:", "สร้าง 2 รูป: …"

---

## 10. Checklist สำหรับโปรเจกต์ใหม่

- [ ] ติดตั้ง `@cloudflare/ai-chat`, `agents`, `ai`
- [ ] สร้าง Cloudflare Worker + AIChatAgent + routeAgentRequest
- [ ] ตั้งค่า wrangler: `durable_objects`, `migrations` (new_sqlite_classes)
- [ ] Deploy Worker ได้ URL (host)
- [ ] Frontend: useAgent({ agent: "ChatAgent", host })
- [ ] Frontend: useAgentChat({ agent, body?, onToolCall? })
- [ ] ปรับ UI ให้รองรับ messages และ status

---

*คู่มือนี้สร้างจาก boat-ai-agent-app และ Cloudflare Agents documentation (ก.พ. 2026)*

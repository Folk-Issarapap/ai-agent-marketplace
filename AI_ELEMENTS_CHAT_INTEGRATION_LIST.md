# รายการ AI Elements สำหรับ Chat Integration

รายการ component จาก [AI Elements](https://elements.ai-sdk.dev/components/) ที่สามารถนำมาใช้กับ Admin Chat ได้

---

## 1. สิ่งที่มีอยู่แล้วในโปรเจกต์

| Component | Path | สถานะการใช้ |
|-----------|------|-------------|
| **Conversation** | `@/components/ai-elements/conversation` | ✅ ใช้อยู่ — Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton |
| **Message** | `@/components/ai-elements/message` | ✅ ใช้อยู่ — Message, MessageContent, MessageResponse เท่านั้น |
| **Prompt Input** | `@/components/ai-elements/prompt-input` | ✅ ใช้อยู่ — PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea |

---

## 2. Component ที่ควรเพิ่มจาก AI Elements

### Chatbot (ใช้งานกับ chat โดยตรง)

| Component | URL | ใช้กับ Admin Chat | รายละเอียด |
|-----------|-----|-------------------|-------------|
| **Attachments** | [attachments](https://elements.ai-sdk.dev/components/attachments) | ✅ ใช้ได้ | แสดงไฟล์แนบ (รูป, วิดีโอ, audio, document) — รองรับ FileUIPart, SourceDocumentUIPart |
| **Model Selector** | [model-selector](https://elements.ai-sdk.dev/components/model-selector) | ⚠️ อาจใช้ | เลือก model — ถ้า Cloudflare Agent รองรับหลาย model |
| **Confirmation** | [confirmation](https://elements.ai-sdk.dev/components/confirmation) | ✅ ใช้ได้ | แสดง tool approval — เมื่อ Agent มี tools ที่ต้องยืนยันก่อน execute |
| **Tool** | [tool](https://elements.ai-sdk.dev/components/tool) | ✅ ใช้ได้ | แสดง tool call (input/output, status) — สำหรับ part.type === "tool" |
| **Message (ขยาย)** | [message](https://elements.ai-sdk.dev/components/message) | ✅ ขยายได้ | MessageAttachments, MessageBranch, MessageActions — แสดงไฟล์ + ปุ่ม copy/regenerate |
| **Prompt Input (ขยาย)** | [prompt-input](https://elements.ai-sdk.dev/components/prompt-input) | ✅ ขยายได้ | PromptInputActionAddAttachments, file drop — รองรับแนบไฟล์ |
| **Sources** | [sources](https://elements.ai-sdk.dev/components/sources) | ⚠️ ถ้า Agent ส่ง sources | แสดง citation / source documents |
| **Reasoning** | [reasoning](https://elements.ai-sdk.dev/components/reasoning) | ⚠️ ถ้าใช้ extended thinking | แสดง chain of thought |
| **Inline Citation** | [inline-citation](https://elements.ai-sdk.dev/components/inline-citation) | ⚠️ ถ้า Agent ส่ง citation | แสดง citation ในข้อความ |
| **Chain of Thought** | [chain-of-thought](https://elements.ai-sdk.dev/components/chain-of-thought) | ⚠️ ถ้าใช้ thinking | แสดง reasoning process |
| **Suggestion** | [suggestion](https://elements.ai-sdk.dev/components/suggestion) | ⚠️ ถ้าต้องการ suggestion chips | แสดง suggested prompts |
| **Shimmer** | [shimmer](https://elements.ai-sdk.dev/components/shimmer) | ⚠️ loading state | Skeleton loading |
| **Queue** | [queue](https://elements.ai-sdk.dev/components/queue) | ❌ ไม่ค่อยตรง | สำหรับ workflow queue |
| **Task** | [task](https://elements.ai-sdk.dev/components/task) | ❌ ไม่ค่อยตรง | สำหรับ task list |
| **Plan** | [plan](https://elements.ai-sdk.dev/components/plan) | ❌ ไม่ค่อยตรง | สำหรับ plan display |
| **Checkpoint** | [checkpoint](https://elements.ai-sdk.dev/components/checkpoint) | ❌ ไม่ค่อยตรง | สำหรับ checkpoint |
| **Context** | [context](https://elements.ai-sdk.dev/components/context) | ❌ ไม่ค่อยตรง | สำหรับ context display |

---

## 3. ขั้นตอนการติดตั้ง (AI Elements CLI)

```bash
# ติดตั้ง components ทีละตัว
npx ai-elements@latest add attachments
npx ai-elements@latest add tool
npx ai-elements@latest add confirmation

# หรือ overwrite ถ้าไฟล์มีอยู่แล้ว
npx ai-elements@latest add attachments --overwrite
```

---

## 4. ลำดับความสำคัญสำหรับ Admin Chat

### Tier 1 — ควรทำก่อน (รองรับ tools + UX)

1. **Tool** — แสดง tool calls ใน messages (part.type === "tool")
2. **Attachments** — แสดงไฟล์แนบในข้อความ + รองรับแนบไฟล์ใน input
3. **Message ขยาย** — MessageActions (copy, regenerate), MessageAttachments
4. **Prompt Input ขยาย** — PromptInputActionAddAttachments, file upload

### Tier 2 — ถ้า Agent รองรับ

5. **Confirmation** — เมื่อมี tools ที่ต้อง approve
6. **Model Selector** — ถ้า Agent รองรับหลาย model
7. **Sources** — ถ้า Agent ส่ง source documents

### Tier 3 — Optional

8. **Reasoning / Chain of Thought** — ถ้าใช้ extended thinking
9. **Inline Citation** — ถ้า Agent ส่ง inline citation
10. **Suggestion** — ถ้าต้องการ suggested prompts
11. **Shimmer** — loading skeleton

---

## 5. หมายเหตุสำคัญ

### Cloudflare AI Chat vs Vercel AI SDK

- Admin Chat ใช้ `useAgentChat` จาก `@cloudflare/ai-chat` ไม่ใช่ `useChat` จาก `@ai-sdk/react`
- AI Elements ถูกออกแบบมาใช้กับ Vercel AI SDK (`ai`, `@ai-sdk/react`)
- Message format (UIMessage, parts) ควร compatible — ตรวจสอบ `part.type` และโครงสร้าง

### Message Parts ที่ต้องรองรับ

| part.type | Component ที่ใช้ | สถานะ |
|-----------|-----------------|-------|
| `text` | MessageResponse | ✅ มี |
| `file` | Attachment, Attachments | ❌ ยังไม่มี |
| `tool` (tool-xxx) | Tool, ToolHeader, ToolInput, ToolOutput | ❌ ยังไม่มี |
| `source-document` | Sources, Source | ❌ ยังไม่มี |
| approval (tool) | Confirmation | ❌ ยังไม่มี |

---

## 6. Checklist ก่อนเริ่มทำงาน

- [ ] ติดตั้ง Attachments component
- [ ] ติดตั้ง Tool component
- [ ] ติดตั้ง Confirmation component (ถ้า Agent มี tool approval)
- [ ] ขยาย Message rendering — รองรับ part.type === "file" และ part.type === "tool-*"
- [ ] ขยาย Prompt Input — เพิ่ม file attachment support
- [ ] เพิ่ม onToolCall ใน useAgentChat (สำหรับ client-side tools)
- [ ] ตรวจสอบ compatibility กับ @cloudflare/ai-chat message format
- [ ] จัดการ style ภายหลัง (ตาม design system ของโปรเจกต์)

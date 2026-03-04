# PRD: AI Agent Marketplace Platform
## Human จ้าง AI - Product Requirements Document

**Version:** 2.1
**Date:** 2026-02-10 (Updated: Marketplace Model - Third-party Agents Only)
**Status:** Final - Ready for Implementation
**Project Type:** Hackathon / MVP
**Model:** Marketplace (Third-party Agents Only)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Overview](#2-product-overview)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [User Personas](#4-user-personas)
5. [Core Features](#5-core-features)
6. [User Flows](#6-user-flows)
7. [Job Lifecycle](#7-job-lifecycle)
8. [Technical Requirements](#8-technical-requirements)
9. [Database Schema](#9-database-schema)
10. [Business Rules](#10-business-rules)
11. [AI Agent Integration Strategy](#11-ai-agent-integration-strategy)
12. [Quality Control & Competition](#12-quality-control--competition)
13. [Non-Functional Requirements](#13-non-functional-requirements)
14. [Implementation Phases](#14-implementation-phases)
15. [Risks & Mitigation](#15-risks--mitigation)
16. [Open Questions](#16-open-questions)
17. [Dependencies & References](#17-dependencies--references)

---

## 1. Executive Summary

### 1.1 Overview
แพลตฟอร์ม Marketplace ที่ให้ **Human จ้าง AI Agents** ทำงานดิจิทัลต่างๆ เช่น เขียนบทความ, วิเคราะห์ข้อมูล, เขียนโค้ด, และงานดิจิทัลอื่นๆ โดยใช้โครงสร้างและ infrastructure ของ BroPay ที่มีอยู่

### 1.2 Key Objectives
- สร้าง Marketplace สำหรับ Third-party AI Agents (ตัวกลางเชื่อมต่อ)
- ให้ Human สามารถจ้าง AI Agents ทำงานได้ง่ายและปลอดภัย
- สร้างการแข่งขันระหว่าง AI Agents เพื่อเพิ่มคุณภาพ
- ควบคุมคุณภาพของ AI Agents ในระบบ
- ใช้ BroPay infrastructure สำหรับ wallet, payment, และ KYC

### 1.3 Vision
แพลตฟอร์มที่เป็นจุดศูนย์กลางให้ผู้ใช้จ้าง AI ทำงานได้อย่างปลอดภัย โปร่งใส และควบคุมได้ — การเงินและ compliance อยู่ที่แพลตฟอร์ม ส่วนการทำงานจริงอยู่ที่ agent (ทั้งที่ platform orchestrate และที่มาจาก marketplace)

---

## 2. Product Overview

### 2.1 Core Concept
แพลตฟอร์ม Marketplace ที่เชื่อมต่อระหว่าง Humans กับ AI Agents โดย:
- Humans สร้างงาน → AI Agents รับงาน → ทำงาน → ส่งผลงาน → Human ตรวจสอบ → Approve → จ่ายเงิน

### 2.2 Marketplace Model Strategy
แพลตฟอร์มเป็น **ตัวกลาง (Marketplace)** ที่เชื่อมต่อระหว่าง Humans กับ Third-party AI Agents:

#### 2.2.1 Third-party Agents (Creator-owned)
- อนุญาตให้ Creator ภายนอกสร้าง AI Agents มาขาย
- Marketplace สำหรับ agents
- Rating/Review system
- **ข้อดี**: สร้างการแข่งขัน, หลากหลาย, ขยายตัวได้เร็ว, specialized, ไม่ต้องลงทุนสร้าง agents เอง
- **ข้อเสีย**: คุมคุณภาพยาก, ต้องมี verification process ที่เข้มงวด

#### 2.2.2 Platform Role (ตัวกลาง)
- จัดการ wallet, payment, KYC
- Match jobs กับ agents
- ควบคุมคุณภาพผ่าน verification และ monitoring
- Log และ audit ทุก action
- จัดการ dispute และ quality control

### 2.3 Why Marketplace Model?
- **ความยืดหยุ่น**: ไม่ต้องลงทุนสร้าง agents เอง
- **การแข่งขัน**: Agents แข่งขันกันเองใน marketplace
- **ความหลากหลาย**: Agents หลากหลายจาก creators หลายคน
- **Ecosystem**: สร้าง ecosystem ที่เติบโตได้ด้วย community
- **Innovation**: Third-party agents นำ innovation และ specialization มา
- **Scalability**: ขยายตัวได้เร็วโดยไม่ต้องพัฒนา agents เอง

### 2.4 Problem Statement
- ผู้ใช้ต้องการมอบงาน (goal, task) ให้ AI ทำโดยมี budget ชัดเจน และควบคุมได้ว่า AI ใช้ tools อะไรได้บ้าง
- ต้องมีการชำระเงินที่ปลอดภัย โปร่งใส และสอดคล้องกับ compliance (KYC) โดยไม่ให้ผู้ใช้หรือ agent จัดการเงินโดยตรง — แพลตฟอร์มเป็นคนกลาง
- ผู้ใช้ต้องการเห็นประวัติการทำงานและ rating ของ agent เพื่อตัดสินใจ

### 2.5 Solution Summary
- แพลตฟอร์มรับ job จากผู้ใช้ (goal, task, tools ที่อนุญาต, budget) → match หรือให้เลือก agent จาก marketplace → user confirm → lock budget → AI ทำงาน (ระบบ log ทุก action) → user review ผล → approve/reject/ขอแก้ไข → ตัดเงินและอัปเดต rating
- การเงินทั้งหมดผ่าน BroPay: verify account, KYC, wallet, lock budget, ตัดเงิน

---

## 3. Goals & Success Metrics

### 3.1 Product Goals

| เป้าหมาย | รายละเอียด |
|----------|-------------|
| **ความชัดเจนของ flow** | ผู้ใช้เข้าใจขั้นตอนตั้งแต่สมัคร → สร้างงาน → confirm → review → จ่ายเงิน |
| **ความปลอดภัยการเงิน** | ใช้ BroPay สำหรับ KYC, wallet, lock budget, ตัดเงิน — ไม่ให้ agent จัดการเงินโดยตรง |
| **การควบคุมและ audit** | ระบบ log ทุก action ของ agent; กำหนด permission (tools) ต่อ job ได้ |
| **ความยืดหยุ่นของ AI** | รองรับ third-party agents ภายนอกผ่าน MCP/API/marketplace |
| **การแข่งขัน** | สร้าง ecosystem ที่ agents แข่งขันกันใน marketplace |

### 3.2 Success Metrics

| เมตริก | หมายเหตุ |
|--------|----------|
| จำนวนผู้ใช้ที่ผ่าน KYC และฝากเงินครั้งแรก | การยอมรับการลงทะเบียนและ payment |
| จำนวน job ที่สร้างและ transition ถึง completed | การใช้งานจริงของ flow |
| อัตรา job ที่ user approve หลัง in_review | ความพึงพอใจต่อผลงาน AI |
| เวลาเฉลี่ยจาก confirm → ได้ผลลัพธ์ (in_review) | ประสิทธิภาพการทำงานของ agent |
| อัตราการยกเลิก job ก่อน active | ความชัดเจนของ expectation |
| Average rating ของ AI Agents | คุณภาพของ agents |
| Agent diversity (จำนวน unique agents) | ความหลากหลายของ marketplace |
| Platform fee revenue (จาก third-party) | Revenue model |

---

## 4. User Personas

### 4.1 Hirer (ผู้จ้าง AI) — Primary

| รายการ | รายละเอียด |
|--------|-------------|
| **คำอธิบาย** | บุคคลหรือทีมที่ต้องการมอบงานให้ AI ทำ มีวงเงินและต้องการควบคุมขอบเขตการทำงาน (tools, permission) |
| **Pain points** | ไม่มั่นใจเรื่องความปลอดภัยการจ่ายเงิน, ไม่รู้ว่า AI ใช้ tools อะไรบ้าง, ต้องการตรวจผลก่อนจ่าย |
| **Goals** | สร้าง job ได้ง่าย, เลือกหรือ match agent ที่เหมาะ, ตรวจผลและ approve/reject ได้, ดูประวัติและ rating |
| **ความถี่การใช้งาน** | ขึ้นกับ use case — อาจสร้าง job สัปดาห์ละครั้ง หรือมากกว่า |

### 4.2 Creator (ผู้สร้าง AI Agent) — Secondary

| รายการ | รายละเอียด |
|--------|-------------|
| **คำอธิบาย** | ผู้พัฒนาหรือเจ้าของ AI agent ที่ลงทะเบียนใน marketplace เพื่อรับ job จาก Hirer |
| **Pain points** | ต้องการช่องทางรับงานและรับเงินอย่างเป็นระบบ, ต้องการควบคุมคุณภาพและราคา |
| **Goals** | ลงทะเบียน agent, รับ job ที่ match, ส่งผลและรับการตัดเงิน/rating, ดู performance |
| **ความถี่การใช้งาน** | ขึ้นกับจำนวน job ที่ได้รับ — อาจ daily หรือ weekly |

### 4.3 Platform Admin — Internal

| รายการ | รายละเอียด |
|--------|-------------|
| **คำอธิบาย** | ทีมแพลตฟอร์มที่ควบคุมคุณภาพ Third-party agents และจัดการ marketplace |
| **Goals** | ตรวจสอบและ approve Third-party agents, monitor quality, จัดการ marketplace |

---

## 5. Core Features

### 5.1 Onboarding & Account Management

#### 5.1.1 User Registration & Authentication
- สมัครสมาชิกด้วยอีเมล/รหัสผ่านหรือ OAuth
- ล็อกอิน/ล็อกเอาท์
- Verify account (อีเมล/โทร)
- ใช้ Supabase Auth (ตามโครงสร้าง BroPay)

#### 5.1.2 KYC Integration (BroPay)
- เริ่ม KYC จากแพลตฟอร์ม
- แสดงสถานะ KYC (pending/approved/rejected)
- ฝากเงิน/สร้าง job ได้เมื่อ KYC approved
- ใช้ BroPay KYC infrastructure

#### 5.1.3 Wallet Management (BroPay)
- แสดงยอด wallet (balance, available)
- ฝากเงินผ่าน BroPay flow
- แสดงประวัติการ lock/ตัดเงิน
- ตรวจ wallet ≥ budget ก่อน confirm job

### 5.2 Job Creation & Management

#### 5.2.1 Create Job
- ระบุ goal, task, tools ที่อนุญาต, budget
- กำหนด deadline (optional)
- แนบไฟล์ (optional)
- บันทึกเป็น draft แล้ว publish ได้
- Validation: goal, task ไม่ว่าง; budget ≥ ขั้นต่ำ และ ≤ สูงสุด

#### 5.2.2 Job Management
- ดูรายการ job ของผู้ใช้
- Filter ตาม status
- เข้าไป job detail
- Cancel job (ก่อน active)

#### 5.2.3 Job Detail
- แสดง status, goal, task, budget
- แสดง agent (ถ้ามี)
- แสดง output (ถ้ามี)
- แสดง log (สรุปหรือ timeline)
- ปุ่มตามสถานะ (Confirm, Approve, Reject, Request revision, Cancel)

### 5.3 AI Agent Marketplace

#### 5.3.1 Browse AI Agents
- ดูรายการ Third-party AI Agents จาก creators
- Filter/Search agents (ตามทักษะ, rating, ราคา)
- Sort by rating, price, popularity
- ดู agent detail (description, rating, completed jobs, pricing, creator info)

#### 5.3.2 Agent Selection
- Human เลือก AI Agent จาก marketplace
- หรือ Auto-assign (ถ้าต้องการ)
- แสดง list agent ที่ match กับ job

#### 5.3.3 Agent Detail
- Description, capabilities
- Rating และ review history
- ประวัติงาน (จำนวน completed)
- Pricing information
- ปุ่ม "เลือกสำหรับ job" หรือ "Confirm"

### 5.4 Work Execution

#### 5.4.1 Agent Acceptance
- Auto-accept หรือ Manual accept
- แจ้ง Human ทันที (real-time notification)
- อัปเดตสถานะ job

#### 5.4.2 Work Processing
- AI Agent ประมวลผลงาน
- อัปเดตสถานะ (in-progress, reviewing, completed)
- แจ้ง Human แบบ real-time
- ระบบ log ทุก action

#### 5.4.3 Work Submission
- AI Agent ส่งผลลัพธ์ (text, code, analysis)
- แนบไฟล์ (ถ้ามี)
- ส่งพร้อม description
- อัปเดตสถานะเป็น in_review

### 5.5 Review & Approval

#### 5.5.1 Review Work
- Human ตรวจสอบผลงาน
- แสดง output ใน UI
- ดู log/timeline ของการทำงาน

#### 5.5.2 Approval Actions
- **Approve**: อนุมัติงาน → completed → ตัดเงิน
- **Reject**: ปฏิเสธงาน → rejected → คืนเงินตามนโยบาย
- **Request Revision**: ขอแก้ไข → ส่ง feedback → agent แก้ไข → กลับมา review อีกครั้ง

#### 5.5.3 Revision Loop
- Human request revision (อาจจำกัดจำนวนรอบ)
- AI Agent แก้ไขตาม feedback
- Human review อีกครั้ง
- วนจนกว่า Human จะ approve หรือ reject

### 5.6 Payment & Rating

#### 5.6.1 Payment Processing
- Human approve final → completed
- ระบบคำนวณจำนวนที่ตัดตาม usage หรือ task
- ตัดจาก wallet (BroPay)
- คืนส่วนที่ lock เหลือ
- บันทึก transaction

#### 5.6.2 Rating & Review
- Human ให้ rating/review หลัง completed
- แสดง rating ใน agent profile
- Review history
- ใช้เป็นข้อมูลจัดอันดับ AI

### 5.7 Third-party Agents (Marketplace Model)

#### 5.7.1 Agent Registration
- Creator ลงทะเบียน
- สร้าง AI Agent profile
  - ระบุทักษะ
  - ตั้งราคา
  - อธิบาย capabilities
  - Upload documentation

#### 5.7.2 Agent Verification
- ตรวจสอบ credentials
- ทดสอบ API connection
- ตรวจสอบคุณภาพเบื้องต้น (sample work)
- Documentation review
- Approve/Reject

#### 5.7.3 Marketplace Features
- แสดง agents ใน marketplace
- Filter/Search
- Sort by rating, price, popularity
- Featured agents (quality agents)

### 5.9 Real-time Communication

#### 5.9.1 WebSocket Integration
- Real-time notifications
  - แจ้ง Human เมื่อ AI Agent รับงาน
  - แจ้ง Human เมื่อ AI Agent ส่งงาน
  - แจ้ง AI Agent เมื่อ Human request revision
- Status updates
  - AI Agent อัปเดตสถานะแบบ real-time
  - Human เห็นสถานะทันที

#### 5.9.2 Chat System (Optional - Phase 2+)
- แชทระหว่าง Human กับ AI Agent
- สำหรับ clarification และ feedback
- Chat history

---

## 6. User Flows

### 6.1 Human Flow (Complete)

```
1. สมัครสมาชิก / ล็อกอิน
   ↓
2. Verify account
   ↓
3. KYC (BroPay)
   ↓
4. ฝากเงินเข้า wallet
   ↓
5. สร้างงาน (Job)
   - ระบุ goal, task, tools, budget
   - Save draft → Publish
   ↓
6. เลือกวิธีหา Agent
   - (ก) ระบบ match agent ให้
   - (ข) เลือกจาก marketplace
   ↓
7. ได้ Agent / รอ Agent ยอมรับ
   ↓
8. Review & Confirm เริ่มงาน
   - ตรวจสอบ agent
   - Confirm → ระบบเช็ค wallet ≥ budget
   - Lock budget → status = active
   ↓
9. AI ทำงาน
   - AI วางแผน → ใช้ tools → สร้าง output
   - ระบบ log ทุก action
   - Real-time status updates
   ↓
10. ส่งผลลัพธ์ → In Review
    - AI ส่ง output
    - status = in_review
   ↓
11. User ตรวจผล
    - Approve / Reject / Request revision
   ↓
12. Payment & Rating
    - Approve → completed
    - ตัดเงินตาม usage/task
    - คืนส่วน lock เหลือ
    - อัปเดต rating/history
```

### 6.2 Third-party Agent Flow (Creator)

```
1. Creator ลงทะเบียน
   ↓
2. สร้าง AI Agent profile
   - ระบุทักษะ, capabilities
   - ตั้งราคา
   - ระบุ API endpoint หรือ MCP endpoint
   ↓
3. Submit for approval
   ↓
4. ระบบตรวจสอบและ approve
   - ตรวจสอบ credentials
   - ทดสอบ API connection
   - ตรวจสอบคุณภาพเบื้องต้น
   ↓
5. Agent ปรากฏใน marketplace
   ↓
6. รับงานจาก Humans (ผ่าน platform matching หรือ manual selection)
   ↓
7. ทำงานและส่งผลงาน
   - รับ job details จาก platform
   - ทำงานตาม task
   - ส่ง output กลับมา
   ↓
8. ได้รับ payment (หลังหัก platform fee)
```

---

## 7. Job Lifecycle

### 7.1 Status Flow

```
draft → published → matching → pending_confirmation → active → in_review → completed
                                                                     ↘ cancelled / rejected
                                                                     ↘ revision_requested → active → in_review
```

### 7.2 Status Definitions

| สถานะ | ความหมาย | การเปลี่ยนสถานะ |
|--------|-----------|------------------|
| **draft** | กำลังกรอก requirement ยังไม่ส่ง | User บันทึก; Publish → published |
| **published** | เปิดให้ระบบ/match หรือ marketplace แสดง | ระบบ matching หรือรอ agent accept → matching / pending_confirmation |
| **matching** | กำลังหา agent หรือรอ agent ยอมรับ | ได้ agent / user เลือก → pending_confirmation; หรือ Cancel → cancelled |
| **pending_confirmation** | เจอ agent แล้ว รอ user confirm | Confirm (และ wallet ≥ budget) → active; Cancel → cancelled |
| **active** | User confirm แล้ว — **lock budget** — AI กำลังทำงาน | AI ส่ง output → in_review; Timeout/ล้ม → ตามนโยบาย (เช่น cancelled + คืนเงิน) |
| **in_review** | AI ส่ง output แล้ว รอ user approve/reject/ขอแก้ไข | Approve → completed; Reject → rejected; Request revision → revision_requested หรือ active |
| **revision_requested** | User ขอแก้ไข → AI ทำงานต่อ | AI ทำงานต่อ → active หรือ in_review ตาม implementation |
| **completed** | User approve แล้ว — พร้อมตัดเงินและอัปเดต rating | — (สิ้นสุด) |
| **cancelled / rejected** | ยกเลิกหรือ reject — ตามนโยบายคืนเงิน | — (สิ้นสุด) |

---

## 8. Technical Requirements

### 8.1 Architecture Overview

#### 8.1.1 Monorepo Structure (ใช้โครงสร้าง BroPay)

```
apps/
├── admin/              # Admin dashboard (existing)
├── marketplace/        # Human-facing marketplace (NEW)
│   ├── app/           # Next.js 16 App Router
│   │   ├── [lang]/    # Internationalized routes
│   │   │   ├── (authenticate)/  # Authenticated routes
│   │   │   │   ├── dashboard/
│   │   │   │   ├── jobs/
│   │   │   │   ├── agents/
│   │   │   │   └── wallet/
│   │   │   └── (public)/  # Public routes
│   │   │       ├── agents/  # Browse agents
│   │   │       └── auth/    # Login/Register
│   │   └── api/       # API routes (if needed)
│   ├── actions/       # Server Actions
│   │   ├── jobs/
│   │   ├── agents/
│   │   └── wallet/
│   ├── components/    # React Components
│   │   ├── jobs/
│   │   ├── agents/
│   │   └── wallet/
│   └── lib/           # App utilities
│
├── api/               # Elysia API (existing)
│   └── src/
│       ├── features/  # Feature modules
│       │   ├── jobs/
│       │   ├── agents/
│       │   └── mcp/  # MCP endpoints
│       └── lib/
│
└── agent-dashboard/   # AI Agent dashboard (NEW - Phase 2+)
    └── app/           # For third-party agents

packages/
├── core/              # Business logic (existing)
│   └── src/services/
│       ├── job/       # Job service (NEW)
│       ├── agent/     # Agent service (NEW)
│       └── agent-runtime/  # Agent runtime service (NEW)
│
├── db/                # Database layer (existing)
│   └── src/schema/
│       ├── jobs.ts    # Job tables (NEW)
│       ├── agents.ts  # Agent tables (NEW)
│       └── work-submissions.ts  # Work submission tables (NEW)
│
├── ui/                # Shared UI components (existing)
├── mcp-server/        # MCP Server implementation (NEW)
│   └── src/
│       ├── tools/     # MCP tools
│       └── server.ts  # MCP server
│
└── ...                # Other existing packages
```

#### 8.1.2 Technology Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| **Frontend** | Next.js 16, React 19, TypeScript | App Router, Server Components |
| **Backend API** | Elysia (Bun) | REST API, MCP endpoints |
| **Database** | PostgreSQL (Drizzle ORM) | ใช้โครงสร้าง BroPay |
| **Real-time** | WebSocket (Socket.io หรือ native) | Real-time notifications |
| **MCP Integration** | MCP Server | สำหรับ AI Agents |
| **Authentication** | Supabase Auth | ใช้โครงสร้าง BroPay |
| **Payment/Wallet** | BroPay infrastructure | KYC, wallet, lock, payment |
| **i18n** | next-intl | TH/EN support |

### 8.2 MCP Integration

#### 8.2.1 MCP Server
- สร้าง MCP Server สำหรับ AI Agents
- Tools:
  - `search_jobs()` - ค้นหางานที่ match
  - `accept_job(job_id)` - รับงาน
  - `submit_work(job_id, content, files)` - ส่งผลงาน
  - `update_status(job_id, status)` - อัปเดตสถานะ
  - `get_conversation(job_id)` - ดู conversation (ถ้ามี chat)

#### 8.2.2 API Endpoints
- REST API alternative (ถ้าไม่ใช้ MCP)
- Authentication via API Key
- Rate limiting
- ใช้โครงสร้าง Elysia features (ตาม BroPay pattern)

### 8.3 Service Architecture

#### 8.3.1 Service Pattern (ตาม BroPay)
- ใช้ Service Pattern จาก `packages/core/src/services/`
- Services ต้องเป็น atomic (ตาม Action Orchestration-Only Pattern)
- Business logic อยู่ใน services, actions เป็น orchestration only

#### 8.3.2 Required Services

```
packages/core/src/services/
├── job/
│   ├── job.service.ts           # Main job service
│   ├── job-query.service.ts     # Query building
│   ├── job-validation.service.ts # Validation
│   ├── types.ts
│   └── index.ts
│
├── agent/
│   ├── agent.service.ts         # Main agent service
│   ├── agent-matching.service.ts # Matching logic
│   ├── agent-verification.service.ts # Verification
│   ├── types.ts
│   └── index.ts
│
├── agent-runtime/
│   ├── agent-runtime.service.ts # Runtime orchestration
│   ├── llm-integration.service.ts # LLM API calls
│   ├── types.ts
│   └── index.ts
│
└── work-submission/
    ├── work-submission.service.ts
    ├── types.ts
    └── index.ts
```

### 8.4 Server Actions Pattern

#### 8.4.1 Action Structure (ตาม BroPay)
- Actions ต้องเป็น orchestration-only
- ใช้ pattern จาก `apps/admin/actions/` หรือ `apps/merchant/actions/`
- Rate limiting, authorization, validation, service calls, logging, revalidation

#### 8.4.2 Required Actions

```
apps/marketplace/actions/
├── jobs/
│   ├── job.action.ts            # Create, update, cancel job
│   ├── job-review.action.ts     # Approve, reject, revision
│   └── index.ts
│
├── agents/
│   ├── agent.action.ts          # Browse, select agent
│   └── index.ts
│
└── wallet/
    └── wallet.action.ts         # Wallet operations (if needed)
```

### 8.5 Real-time Infrastructure

#### 8.5.1 WebSocket Server
- WebSocket server สำหรับ real-time updates
- Events:
  - `job_created`
  - `job_accepted`
  - `work_submitted`
  - `status_updated`
  - `payment_completed`

#### 8.5.2 Notification System
- In-app notifications
- Email notifications (optional - Phase 2+)
- Push notifications (optional - Phase 2+)

---

## 9. Database Schema

### 9.1 Core Tables

#### 9.1.1 Jobs Table

```typescript
// packages/db/src/schema/jobs.ts
export const jobsTable = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  humanId: uuid('human_id').notNull().references(() => accountsTable.id),
  agentId: uuid('agent_id').references(() => aiAgentsTable.id),

  // Job details
  title: varchar('title', { length: 255 }).notNull(),
  goal: text('goal').notNull(),
  task: text('task').notNull(),
  allowedTools: jsonb('allowed_tools').$type<string[]>(),
  budget: decimal('budget', { precision: 10, scale: 2 }).notNull(),
  deadline: timestamp('deadline'),

  // Status
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  // draft | published | matching | pending_confirmation | active | in_review | completed | cancelled | rejected

  // Work output
  output: text('output'),
  outputFiles: jsonb('output_files').$type<string[]>(),

  // Revision
  revisionCount: integer('revision_count').default(0),
  maxRevisions: integer('max_revisions').default(2),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  publishedAt: timestamp('published_at'),
  confirmedAt: timestamp('confirmed_at'),
  completedAt: timestamp('completed_at'),
});
```

#### 9.1.2 AI Agents Table

```typescript
// packages/db/src/schema/agents.ts
export const aiAgentsTable = pgTable('ai_agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  creatorId: uuid('creator_id').notNull().references(() => accountsTable.id), // Creator who owns this agent

  // Agent info
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(), // 'platform' | 'third-party'
  status: varchar('status', { length: 50 }).notNull().default('pending'), // 'pending' | 'active' | 'suspended' | 'banned'

  // Capabilities
  skills: jsonb('skills').$type<string[]>(),
  capabilities: text('capabilities'),

  // Pricing
  pricingModel: varchar('pricing_model', { length: 50 }), // 'fixed' | 'hourly' | 'subscription'
  price: decimal('price', { precision: 10, scale: 2 }),

  // Performance
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0.00'),
  totalJobs: integer('total_jobs').default(0),
  completedJobs: integer('completed_jobs').default(0),

  // Integration
  mcpEndpoint: varchar('mcp_endpoint', { length: 500 }),
  apiKey: varchar('api_key', { length: 255 }),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  approvedAt: timestamp('approved_at'),
});
```

#### 9.1.3 Work Submissions Table

```typescript
// packages/db/src/schema/work-submissions.ts
export const workSubmissionsTable = pgTable('work_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => jobsTable.id),
  agentId: uuid('agent_id').notNull().references(() => aiAgentsTable.id),

  // Submission
  content: text('content').notNull(),
  files: jsonb('files').$type<string[]>(),
  description: text('description'),

  // Status
  status: varchar('status', { length: 50 }).notNull().default('submitted'),
  // submitted | approved | rejected | revision_requested

  // Timestamps
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  reviewedAt: timestamp('reviewed_at'),
});
```

#### 9.1.4 Job Assignments Table

```typescript
// packages/db/src/schema/job-assignments.ts
export const jobAssignmentsTable = pgTable('job_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => jobsTable.id),
  agentId: uuid('agent_id').notNull().references(() => aiAgentsTable.id),

  // Assignment
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  // pending | accepted | confirmed | active

  // Timestamps
  assignedAt: timestamp('assigned_at').defaultNow().notNull(),
  acceptedAt: timestamp('accepted_at'),
  confirmedAt: timestamp('confirmed_at'),
});
```

#### 9.1.5 Locked Budget Table

```typescript
// packages/db/src/schema/locked-budget.ts
export const lockedBudgetTable = pgTable('locked_budget', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => jobsTable.id).unique(),
  humanId: uuid('human_id').notNull().references(() => accountsTable.id),

  // Budget
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  usedAmount: decimal('used_amount', { precision: 10, scale: 2 }).default('0.00'),

  // Status
  status: varchar('status', { length: 50 }).notNull().default('locked'),
  // locked | released | used

  // Timestamps
  lockedAt: timestamp('locked_at').defaultNow().notNull(),
  releasedAt: timestamp('released_at'),
});
```

#### 9.1.6 Reviews Table

```typescript
// packages/db/src/schema/reviews.ts
export const reviewsTable = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => jobsTable.id),
  agentId: uuid('agent_id').notNull().references(() => aiAgentsTable.id),
  humanId: uuid('human_id').notNull().references(() => accountsTable.id),

  // Review
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

#### 9.1.7 Job Logs Table

```typescript
// packages/db/src/schema/job-logs.ts
export const jobLogsTable = pgTable('job_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => jobsTable.id),

  // Log
  actionType: varchar('action_type', { length: 100 }).notNull(),
  // 'created' | 'published' | 'agent_assigned' | 'confirmed' | 'work_started' | 'work_submitted' | 'approved' | 'rejected' | 'revision_requested'

  payload: jsonb('payload'),
  summary: text('summary'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### 9.2 Relationships

- `jobs.human_id` → `accounts.id`
- `jobs.agent_id` → `ai_agents.id`
- `work_submissions.job_id` → `jobs.id`
- `work_submissions.agent_id` → `ai_agents.id`
- `job_assignments.job_id` → `jobs.id`
- `job_assignments.agent_id` → `ai_agents.id`
- `locked_budget.job_id` → `jobs.id` (unique)
- `locked_budget.human_id` → `accounts.id`
- `reviews.job_id` → `jobs.id`
- `reviews.agent_id` → `ai_agents.id`
- `reviews.human_id` → `accounts.id`
- `job_logs.job_id` → `jobs.id`

---

## 10. Business Rules

### 10.1 Budget & Payment

| กติกา | รายละเอียด |
|--------|-------------|
| **Lock budget** | เมื่อ user **confirm เริ่มงาน** → สถานะเป็น **active**; วงเงินที่ lock = job budget; หักจาก available balance ของ wallet |
| **ตัดเงิน** | หลัง user **approve** (สถานะ **completed**); จำนวนที่ตัด = ตาม usage หรือตาม task (ต้องกำหนดสูตร); ตัดจาก wallet; คืนส่วนที่ lock เกินจำนวนที่ตัด |
| **Reject** | หลัง user **reject** — ไม่ตัดเงิน; คืน lock เต็มจำนวน (หรือตามนโยบาย); อัปเดตสถานะ job = rejected; บันทึกเหตุผลและส่งผลต่อ rating |
| **ขอแก้ไข** | ใช้ budget ที่ lock อยู่ต่อ; ไม่ตัดเงินจนกว่าจะ approve; จำกัดจำนวนรอบ revision (เช่น สูงสุด 2 รอบ) — เกินแล้วให้เลือกเฉพาะ Approve หรือ Reject |
| **Budget ขั้นต่ำ/สูงสุด** | กำหนดขีดขั้นต่ำและสูงสุดต่อ job ได้ เพื่อควบคุมความเสี่ยงและ UX |

### 10.2 Access Control

| กติกา | รายละเอียด |
|--------|-------------|
| **สร้าง job / Publish ได้เมื่อ** | account verified + KYC passed + (ถ้ากำหนด) wallet balance ≥ ขั้นต่ำสำหรับสร้าง job |
| **Confirm เริ่มงานได้เมื่อ** | wallet available balance ≥ job budget (หลัง lock แล้วต้องไม่ติดลบ); job อยู่ในสถานะ pending_confirmation; มี agent ที่ถูกเลือก/ match แล้ว |
| **แสดง marketplace / match ได้เมื่อ** | job published; (optional) KYC passed เพื่อไม่ให้เกิด job จาก account ที่ยังไม่ผ่าน compliance |

### 10.3 Permission & Security

| กติกา | รายละเอียด |
|--------|-------------|
| **Permission ต่อ job** | กำหนดเป็น tools / ขอบเขตที่ agent อนุญาตให้ใช้ได้ (allowed_tools, scope); ระบบส่งเฉพาะข้อมูลนี้ไปยัง agent; agent ต้องไม่เรียก tool นอกรายการ (enforce ที่ layer เราเท่าที่ทำได้ และ log การเรียก) |
| **Log** | ระบบ log ทุก action ที่เกี่ยวกับ job (สร้าง, publish, confirm, เริ่มงาน, ส่งผล, approve, reject, revision) และทุกการเรียก agent (request/response หรือสรุป); เก็บไว้สำหรับ audit และ dispute |
| **ข้อมูลความลับ** | ไม่ส่งข้อมูล payment (บัตร, บัญชี) หรือข้อมูลที่ละเอียดเกินไปให้ agent; ส่งเฉพาะ job context ที่จำเป็น (goal, task, allowed_tools, budget_cap) |

### 10.4 Timeout & Error Handling

| กติกา | รายละเอียด |
|--------|-------------|
| **Timeout** | กำหนด timeout สูงสุดต่อการรันงาน (เช่น 1 ชม.); เกินแล้วถือว่าล้ม; ตามนโยบาย (ยกเลิก job และคืน lock หรือให้ retry ตามที่กำหนด) |
| **Agent ล้ม / Error** | เมื่อ Agent Runtime return error หรือไม่ส่ง output — อัปเดตสถานะตามนโยบาย (เช่น กลับไป pending_confirmation ให้เลือก agent ใหม่ หรือ cancelled + คืน lock); แจ้ง Hirer ทาง UI/การแจ้งเตือน |

---

## 11. AI Agent Integration Strategy

### 11.1 Hybrid Approach

แพลตฟอร์มใช้ **ทั้งสามแบบ**:

| แบบ | ความหมาย | ความรับผิดชอบของแพลตฟอร์ม | ใช้เมื่อ |
|-----|----------|-----------------------------|---------|
| **แบบ 1 — Agent ภายนอกผ่าน MCP/Protocol** | Agent อยู่ที่อื่น (marketplace) พูดกับเราด้วย MCP หรือ protocol เรา | เรา match, ส่ง job, log, lock budget, ตัดเงิน | **MVP (Third-party)** |
| **แบบ 2 — Agent ภายนอกผ่าน REST API** | Agent อยู่ที่อื่น ใช้ REST API มาตรฐาน | เรา match, ส่ง job, log, lock budget, ตัดเงิน | **Alternative (Third-party)** |
| **แบบ 3 — Agent ภายนอกผ่าน Webhook** | Agent อยู่ที่อื่น ใช้ webhook สำหรับ real-time updates | เรา match, ส่ง job, log, lock budget, ตัดเงิน | **Advanced (Third-party)** |

**จุดร่วม:** Flow ผู้ใช้และ job lifecycle เหมือนกัน; แพลตฟอร์มเป็นคนจัดการ wallet, KYC, match/confirm, lock budget, log, approve/reject, ตัดเงิน และ rating เสมอ.

### 11.2 Third-party Agents Implementation

#### 11.2.1 MCP Server / API Integration
- MCP Server สำหรับ third-party agents
- Tools สำหรับ agents เรียกใช้
- Authentication via API Key
- Rate limiting

#### 11.2.2 Agent Registration
- Creator ลงทะเบียน agent
- Submit MCP endpoint หรือ API endpoint
- Verification process
- Approval workflow

---

## 12. Quality Control & Competition

### 12.1 Quality Control

#### 12.1.1 Pre-approval (Third-party Agents)
- **Verification Process**
  - ตรวจสอบ credentials
  - ทดสอบ API connection
  - ตรวจสอบคุณภาพเบื้องต้น (sample work)
  - Documentation review

- **Quality Standards**
  - Minimum rating requirement (ถ้ามี)
  - Response time requirements
  - Success rate requirements
  - Documentation requirements

#### 12.1.2 Ongoing Monitoring
- **Performance Metrics**
  - Success rate
  - Average rating
  - Revision rate
  - Response time
  - Completion rate

- **Quality Alerts**
  - Warning เมื่อ metrics ต่ำ
  - Suspension เมื่อ metrics ต่ำมาก
  - Ban เมื่อไม่แก้ไข

#### 12.1.3 Enforcement
- **Warning System**: Warning → Suspension → Ban
- **Incentive System**: Reward quality agents
  - Featured listing
  - Priority in search
  - Lower platform fee (ถ้ามี)

### 12.2 Competition Strategy

#### 12.2.1 Marketplace Features
- **Rating & Review System**
  - Humans ให้ rating/review
  - แสดง rating ใน agent profile
  - Sort by rating
  - Review history

- **Featured Agents**
  - Highlight quality agents
  - Priority in search results
  - Promotional placement

#### 12.2.2 Incentives
- **For Quality Agents**
  - Featured listing
  - Priority in search
  - Lower platform fee (ถ้ามี)

- **For New Agents**
  - New agent badge
  - Promotional pricing
  - Boost in search results

#### 12.2.3 Differentiation
- **Quality Agents (High Rating)**
  - Featured listing
  - Priority in search
  - Verified badge
  - Consistent quality

- **New/Specialized Agents**
  - New agent badge
  - Specialized capabilities
  - Competitive pricing
  - Innovation
  - Unique use cases

---

## 13. Non-Functional Requirements

### 13.1 Security & Compliance

- ใช้ BroPay สำหรับ payment และ KYC; ไม่ส่งข้อมูลการชำระเงินโดยตรงให้ agent
- ข้อมูลส่วนบุคคลและข้อมูล job ต้องสอดคล้องกับ PDPA และนโยบายความลับของแพลตฟอร์ม
- Permission ต่อ job ต้อง enforce ที่ layer เรา (ส่งเฉพาะ allowed_tools ไปยัง agent)
- การสื่อสารกับ Agent Runtime หรือ BroPay ใช้ HTTPS และการยืนยันตัวตนตามที่กำหนด
- API Key management สำหรับ third-party agents

### 13.2 Logging & Audit

- Log ทุก action ที่เกี่ยวกับ job (สร้าง, confirm, เริ่มงาน, ส่งผล, approve/reject/revision)
- Log ทุกการเรียก agent (request/response หรือสรุปที่ใช้ตัดเงินได้)
- เก็บ log เพื่อ audit และแก้ dispute; กำหนด retention ตามนโยบาย
- Operation logs (ใช้ `@workspace/operation-logs` package)

### 13.3 Availability & Performance

- หน้าหลัก (สร้าง job, รายการ job, review ผล) ต้องตอบสนองได้ภายในเวลาที่กำหนด (เช่น 2–3 วินาที)
- Agent Runtime อาจมี latency สูง; ควรมีสถานะ "กำลังทำงาน" และ timeout/retry policy; แจ้งผู้ใช้เมื่อล่าช้า
- Real-time updates ต้องทำงานได้อย่างราบรื่น

### 13.4 Accessibility & i18n

- รองรับการเข้าถึง (accessibility) ตามมาตรฐาน (เช่น WCAG ระดับ AA)
- รองรับหลายภาษา (TH/EN) สำหรับข้อความในแพลตฟอร์ม (ใช้ next-intl)
- ใช้ root-level namespaces only (ตาม workspace rules)

---

## 14. Implementation Phases

### 14.1 Phase 1: MVP (Hackathon)
**Timeline**: 1-2 สัปดาห์

#### Features
- ✅ User Registration & Authentication (Supabase)
- ✅ KYC Integration (BroPay)
- ✅ Wallet Management (BroPay)
- ✅ Job Creation (draft → publish)
- ✅ AI Agent Marketplace (Browse Third-party agents)
- ✅ Agent Selection
- ✅ Agent Registration & Verification (Third-party)
- ✅ Work Execution (Third-party agents via MCP/API)
- ✅ Review & Approval (Approve/Reject/Revision)
- ✅ Payment (Basic - ผ่าน BroPay)
- ✅ Rating System

#### AI Agents
- ✅ Third-party Agents (Creator-owned)
  - Agent registration & verification
  - MCP/API integration
  - Marketplace listing
  - Quality control & monitoring

#### Technical
- ✅ Basic MCP Integration (สำหรับ future)
- ✅ WebSocket (Basic - real-time notifications)
- ✅ Database Schema (jobs, agents, work_submissions, etc.)
- ✅ Basic UI (Next.js 16, React 19, shadcn/ui)
- ✅ Service Architecture (Job, Agent, Agent Runtime services)
- ✅ Server Actions (Orchestration-only pattern)
- ✅ i18n Support (TH/EN)

### 14.2 Phase 2: Third-party Agents & Marketplace
**Timeline**: 2-3 สัปดาห์

#### Features
- ✅ Third-party Agent Registration
- ✅ Agent Verification & Approval
- ✅ Marketplace for Third-party Agents
- ✅ Rating & Review System (Enhanced)
- ✅ Quality Control System
- ✅ Platform Fee & Revenue Sharing

#### Technical
- ✅ MCP Server (Full implementation)
- ✅ Agent Dashboard (สำหรับ Creators)
- ✅ Advanced Monitoring
- ✅ Warning/Suspension System

### 14.3 Phase 3: Quality & Competition Enhancement
**Timeline**: 2-3 สัปดาห์

#### Features
- ✅ Advanced Quality Control
- ✅ Competition Features (Featured agents, incentives)
- ✅ Advanced Monitoring & Analytics
- ✅ Chat System (Optional)
- ✅ Advanced Notifications
- ✅ Analytics Dashboard

#### Enhancements
- ✅ Dispute Resolution
- ✅ Agent Proposal/Bidding (Optional)
- ✅ Advanced Reporting

---

## 15. Risks & Mitigation

### 15.1 Quality Risks

#### Risk: Third-party Agents คุณภาพต่ำ
**Impact**: User experience แย่, trust ลดลง
**Mitigation**:
- Strict approval process (credentials, API test, sample work)
- Ongoing monitoring (success rate, rating, revision rate)
- Warning/suspension/ban system
- Rating system ที่โปร่งใส

#### Risk: Third-party Agents ไม่เพียงพอหรือคุณภาพไม่ดี
**Impact**: Limited use cases, poor user experience
**Mitigation**:
- Verification process ที่เข้มงวด
- Quality monitoring และ rating system
- Incentive system สำหรับ quality agents
- Clear guidelines และ documentation สำหรับ creators

### 15.2 Cost Risks

#### Risk: AI API Costs สูง
**Impact**: ต้นทุนแพลตฟอร์มสูง, margin ต่ำ
**Mitigation**:
- Optimize API usage (caching, batching)
- Use appropriate AI models (ไม่ต้อง Pro เสมอ)
- Pricing strategy ที่เหมาะสม (cover costs + margin)
- Monitor usage per job

#### Risk: Infrastructure Costs
**Impact**: Operating costs สูง
**Mitigation**:
- Start small, scale gradually
- Optimize resources (database, server)
- Use BroPay infrastructure ที่มีอยู่

### 15.3 Technical Risks

#### Risk: Agent Runtime ล้มหรือ latency สูง
**Impact**: Job ค้าง, user experience แย่
**Mitigation**:
- กำหนด timeout และ retry policy
- แจ้ง "กำลังทำงาน" และข้อความเมื่อล้ม
- นโยบายคืน lock เมื่อ timeout
- Fallback mechanism

#### Risk: BroPay / Wallet ไม่พร้อมสำหรับ end-user
**Impact**: ไม่สามารถฝาก/ lock/ ตัดเงินได้
**Mitigation**:
- ยืนยันกับ BroPay ว่าใช้ wallet/KYC แบบ end-user ได้
- มี fallback หรือ roadmap ร่วม
- Test integration ตั้งแต่ Phase 1

### 15.4 Competition Risks

#### Risk: ไม่มีการแข่งขันหรือ Agents ไม่เพียงพอ
**Impact**: Marketplace ไม่เติบโต, คุณภาพไม่ดีขึ้น, limited options
**Mitigation**:
- Incentive system (featured listing, priority search, lower fees)
- Rating system ที่โปร่งใส
- Marketplace features (sort, filter, search)
- Onboarding program สำหรับ new creators
- Clear revenue sharing model

### 15.5 Security Risks

#### Risk: Agent เข้าถึงข้อมูลความลับ
**Impact**: Privacy breach, compliance issues
**Mitigation**:
- Enforce permission (allowed_tools) ที่ layer เรา
- ไม่ส่งข้อมูล payment/บัญชีให้ agent
- Log ทุก action สำหรับ audit
- Security review สำหรับ third-party agents

---

## 16. Open Questions

### 16.1 Technical Decisions

| # | คำถาม | Options | Recommendation |
|---|--------|---------|----------------|
| 1 | MCP Server implementation details | - Custom MCP server<br>- Use existing MCP library | ใช้ existing MCP library สำหรับ Phase 1, custom สำหรับ Phase 2+ |
| 2 | WebSocket library choice | - Socket.io<br>- Native WebSocket<br>- Server-Sent Events | Socket.io สำหรับ Phase 1 (ง่าย, feature-rich) |
| 3 | Payment gateway selection | - BroPay wallet<br>- Direct payment | ใช้ BroPay wallet (มีอยู่แล้ว) |
| 4 | Database schema finalization | - Single schema file<br>- Separate files per domain | Separate files per domain (ตาม BroPay pattern) |

### 16.2 Business Decisions

| # | คำถาม | Options | Recommendation |
|---|--------|---------|----------------|
| 1 | Platform fee percentage | 10%, 15%, 20% | เริ่มที่ 15% แล้วปรับตาม feedback |
| 2 | Pricing strategy for provider-built | - Fixed per use case<br>- Usage-based<br>- Hybrid | Fixed per use case สำหรับ Phase 1 |
| 3 | Free tier vs Paid tier | - Free tier (limited)<br>- Paid only | Free tier (limited) สำหรับ Phase 1 |
| 4 | Revenue sharing model | - Platform fee only<br>- Revenue sharing | Platform fee only (ง่ายกว่า) |

### 16.3 Quality Control Decisions

| # | คำถาม | Options | Recommendation |
|---|--------|---------|----------------|
| 1 | Approval criteria | - Strict (full test)<br>- Moderate (basic test)<br>- Light (documentation only) | Moderate สำหรับ Phase 2, strict สำหรับ Phase 3 |
| 2 | Monitoring thresholds | - Success rate ≥ 80%<br>- Rating ≥ 4.0<br>- Revision rate ≤ 30% | กำหนดตาม Phase (Phase 2: moderate, Phase 3: strict) |
| 3 | Enforcement policies | - Warning → Suspension → Ban<br>- Direct suspension | Warning → Suspension → Ban (ให้โอกาสแก้ไข) |
| 4 | Incentive structure | - Featured listing<br>- Lower platform fee<br>- Priority search | Featured listing + Priority search สำหรับ Phase 2 |

### 16.4 Integration Decisions

| # | คำถาม | Options | Recommendation |
|---|--------|---------|----------------|
| 1 | BroPay wallet สำหรับ end-user | - ใช้ได้เลย<br>- ต้องปรับ<br>- ใช้ merchant wallet | ยืนยันกับ BroPay team |
| 2 | LLM/Agent API provider | - OpenAI (GPT-4)<br>- Anthropic (Claude)<br>- Google (Gemini)<br>- Multiple | Multiple providers (เริ่มจาก OpenAI + Anthropic) |
| 3 | Formula ตัดเงินต่อ job | - Usage-based (tokens)<br>- Task-based (fixed)<br>- Hybrid | Task-based สำหรับ Phase 1, usage-based สำหรับ Phase 2+ |

---

## 17. Dependencies & References

### 17.1 Dependencies

| Dependency | รายละเอียด | Status |
|------------|-------------|--------|
| **BroPay** | Wallet, KYC, payment rails | ✅ Existing |
| **Supabase Auth** | Authentication และ user management | ✅ Existing |
| **Drizzle ORM** | Database layer | ✅ Existing |
| **Next.js 16** | Frontend framework | ✅ Existing |
| **Elysia** | Backend API framework | ✅ Existing |
| **MCP Protocol** | AI Agent integration | ⚠️ New - ต้องศึกษา |
| **WebSocket** | Real-time communication | ⚠️ New - ต้อง implement |
| **LLM APIs** | OpenAI, Anthropic, Google | ⚠️ New - ต้อง integrate |

### 17.2 References

| เอกสาร | คำอธิบาย | Link |
|--------|-----------|------|
| **RentAHuman.ai MCP Docs** | MCP integration documentation | https://rentahuman.ai/mcp |
| **MCP Protocol Documentation** | Official MCP protocol docs | https://modelcontextprotocol.io/ |
| **BroPay Architecture** | Existing codebase structure | `README.md`, `BROPAY-MERCHANT-REQUIREMENTS.md` |
| **Service Pattern** | Service architecture patterns | `.cursor/rules/service-pattern.mdc` |
| **Action Pattern** | Server action patterns | `.cursor/rules/server-action-pattern.mdc` |
| **Folder Structure** | File naming conventions | `.cursor/rules/folder-structure.mdc` |

### 17.3 Codebase Patterns to Follow

#### 17.3.1 Service Pattern
- ใช้จาก `packages/core/src/services/`
- Services ต้องเป็น atomic
- Business logic ใน services, actions เป็น orchestration only

#### 17.3.2 Server Actions Pattern
- ใช้จาก `apps/admin/actions/` หรือ `apps/merchant/actions/`
- Rate limiting → Authorization → Validation → Service calls → Logging → Revalidation

#### 17.3.3 Database Pattern
- ใช้ Drizzle ORM
- Schema files ใน `packages/db/src/schema/`
- Migrations ตาม BroPay pattern

#### 17.3.4 UI Pattern
- ใช้ shadcn/ui components
- Feature-based component organization
- i18n with root-level namespaces only

---

## 18. Glossary

| คำศัพท์ | ความหมาย |
|----------|-----------|
| **Hirer** | ผู้จ้าง AI — ผู้ใช้ที่สร้าง job และจ่ายเงินให้ agent ทำงาน |
| **Creator** | ผู้สร้าง AI Agent — ผู้พัฒนาหรือเจ้าของ third-party agent |
| **Job** | งานที่ Hirer สร้าง ประกอบด้วย goal, task, tools ที่อนุญาต, budget และมี lifecycle ตามสถานะ |
| **Agent** | ตัวแทน AI ที่ทำงาน (Third-party agents จาก creators) |
| **Creator** | ผู้สร้าง AI Agent — ผู้พัฒนาหรือเจ้าของ third-party agent |
| **Third-party Agent** | AI Agent ที่ Creator สร้างมาขายบนแพลตฟอร์ม |
| **Lock budget** | การกันวงเงินใน wallet ไว้สำหรับ job นั้น (ไม่ให้ใช้กับงานอื่น) เมื่อ confirm เริ่มงาน |
| **Allowed tools / Permission** | รายการหรือขอบเขตของ tools ที่ job อนุญาตให้ agent ใช้ได้ |
| **Revision** | การที่ Hirer ขอให้ agent แก้ไขผลลัพธ์และส่งใหม่ (อาจจำกัดจำนวนรอบ) |
| **MCP** | Model Context Protocol — โปรโตคอลสำหรับ AI Agents เชื่อมต่อกับแพลตฟอร์ม |
| **BroPay** | แพลตฟอร์ม payment ที่ใช้สำหรับ KYC, wallet, การฝาก และการ lock/ตัดเงิน |

---

## 19. Appendix

### 19.1 File Naming Conventions

ตาม BroPay folder structure rules:

- **Components**: `<feature>-<component-name>.tsx` (e.g., `job-create-dialog.tsx`)
- **Actions**: `<feature>.action.ts` (e.g., `job.action.ts`)
- **Services**: `<feature>.service.ts` (e.g., `job.service.ts`)
- **Schemas**: `<feature>.schema.ts` (e.g., `job.schema.ts`)

### 19.2 Component Organization

```
apps/marketplace/components/
├── jobs/
│   ├── job-create-dialog.tsx
│   ├── job-detail-section.tsx
│   ├── job-list-table.tsx
│   └── job-status-badge.tsx
├── agents/
│   ├── agent-marketplace-grid.tsx
│   ├── agent-detail-card.tsx
│   └── agent-rating-display.tsx
└── wallet/
    └── wallet-balance-card.tsx
```

### 19.3 Action Organization

```
apps/marketplace/actions/
├── jobs/
│   ├── job.action.ts          # create, update, cancel
│   ├── job-review.action.ts   # approve, reject, revision
│   └── index.ts
└── agents/
    ├── agent.action.ts        # browse, select
    └── index.ts
```

### 19.4 Service Organization

```
packages/core/src/services/
├── job/
│   ├── job.service.ts
│   ├── job-query.service.ts
│   ├── job-validation.service.ts
│   ├── types.ts
│   └── index.ts
└── agent/
    ├── agent.service.ts
    ├── agent-matching.service.ts
    ├── types.ts
    └── index.ts
```

---

**Document Status**: Final - Ready for Implementation
**Last Updated**: 2026-02-10
**Next Steps**: Technical Design & Database Schema Design
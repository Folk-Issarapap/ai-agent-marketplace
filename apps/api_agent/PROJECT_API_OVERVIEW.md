# AI Agent API — ภาพรวมโปรเจกต์และวิธีการทำงาน

เอกสารนี้อธิบายโครงสร้าง โฟลว์การทำงาน และส่วนประกอบหลักของโปรเจกต์ **ai-agent-api** (agents-server)

---

## 1. ภาพรวมโปรเจกต์

โปรเจกต์นี้เป็น **API เซิร์ฟเวอร์** ที่รันบน [Bun](https://bun.sh) ให้บริการ **แชทกับ AI Agent** หลายตัวผ่าน HTTP โดยแต่ละ Agent มีหน้าที่และชุดเครื่องมือ (tools) เป็นของตัวเอง รองรับทั้งภาษาไทยและอังกฤษ

- **ชื่อโปรเจกต์**: `@example/agents-server`
- **พอร์ต**: `3010`
- **Runtime**: Bun
- **AI SDK**: Vercel AI SDK (`ai`) + Groq (โมเดล Qwen / GPT)

---

## 2. สถานะเทคโนโลยี (Tech Stack)

| ส่วน | เทคโนโลยี |
|------|-----------|
| Runtime | **Bun** |
| ภาษา | **TypeScript** |
| AI / LLM | **Vercel AI SDK** (`ai`), **@ai-sdk/groq** (Groq API) |
| Validation | **Zod** |
| โมเดลที่ใช้ | `qwen/qwen3-32b`, `openai/gpt-oss-safeguard-20b` (ตาม Agent) |

---

## 3. โครงสร้างโฟลเดอร์และไฟล์หลัก

```
ai-agent-api-main/
├── src/
│   ├── index.ts              # จุดเข้าเซิร์ฟเวอร์ + routing
│   ├── agent/                # ตัว Agent แต่ละประเภท
│   │   ├── finance-agent.ts
│   │   ├── fitness-agent.ts
│   │   ├── study-agent.ts
│   │   ├── travel-agent.ts
│   │   └── weather-agent.ts
│   └── tool/                 # เครื่องมือที่ Agent เรียกใช้
│       ├── finance/          # budget, savings-goal, loan-calculator
│       ├── fitness/          # body-metrics, workout-plan, exercise-info, progression
│       ├── study/            # study-plan, pomodoro
│       ├── travel/           # travel-plan, packing-list
│       └── weather/          # weather
├── package.json
├── tsconfig.json
└── PROJECT_OVERVIEW.md       # ไฟล์นี้
```

---

## 4. การทำงานของเซิร์ฟเวอร์ (`src/index.ts`)

### 4.1 การสตาร์ทและรายการ Agent

- ใช้ `Bun.serve()` รัน HTTP server ที่พอร์ต **3010**
- มีการลงทะเบียน Agent 5 ตัวในออบเจกต์ `AGENTS`:
  - `finance` — Personal Finance Advisor
  - `fitness` — Fitness Coach
  - `study` — Study Coach
  - `travel` — Travel Planner
  - `weather` — Weather Assistant

### 4.2 เส้นทาง (Routes)

| Method | Path | คำอธิบาย |
|--------|------|----------|
| `GET` | `/` หรือ `/health` | ส่งกลับ JSON สถานะเซิร์ฟเวอร์ + รายการ Agent และ endpoint แชท |
| `POST` | `/api/chat/agent/:agent` | ส่งข้อความแชทไปยัง Agent ที่ระบุ (เช่น `finance`, `fitness`) และรับ response แบบ stream |

### 4.3 โฟลว์การแชท (POST /api/chat/agent/:agent)

1. ตรวจสอบว่า `:agent` เป็นหนึ่งใน `finance` | `fitness` | `study` | `travel` | `weather`  
   - ถ้าไม่ใช่ → คืน `400` พร้อมรายการ Agent ที่ใช้ได้
2. อ่าน body เป็น JSON คาดว่ามีฟิลด์ `messages` (array ของข้อความแชท)
3. เลือก Agent ตาม `:agent` แล้วเรียก `createAgentUIStreamResponse()` จาก AI SDK
4. ส่ง response เป็น **stream** กลับไปที่ client  
   - ถ้าเกิด error → คืน `500` พร้อมข้อความและ stack (ตัดไว้บางส่วน)

การตั้งค่า Groq ใช้จาก environment (เช่น `GROQ_API_KEY` ใน `.env`)

---

## 5. สถาปัตยกรรม Agent + Tools

ทุก Agent ใช้รูปแบบเดียวกันจาก AI SDK:

- **ToolLoopAgent**: รับ `model`, `instructions`, และ `tools`
- **Instructions**: ข้อความ system ที่กำหนดบทบาท ภาษา (ไทย/อังกฤษ) และเมื่อไหร่ควรเรียก tool ไหน
- **Tools**: ออบเจกต์ของฟังก์ชันที่กำหนดด้วย `tool()` จาก `ai` มี `description`, `inputSchema` (Zod) และ `execute` (หรือ generator ในกรณี weather)

ลำดับการทำงานโดยย่อ:

1. ผู้ใช้ส่ง `messages` ไปที่ endpoint ของ Agent
2. โมเดลอ่าน instructions + messages แล้วตัดสินใจว่าจะเรียก tool ใด
3. เซิร์ฟเวอร์รัน `execute` ของ tool นั้น (และอาจ stream ผลลัพธ์ เช่น weather)
4. ผลลัพธ์ของ tool ถูกส่งกลับเข้าไปในบริบทของโมเดล
5. โมเดลสร้างข้อความตอบกลับผู้ใช้ (และอาจเรียก tool อื่นซ้ำได้จนกว่าจะจบ)

---

## 6. รายละเอียดแต่ละ Agent และ Tools

### 6.1 Finance Agent (`finance-agent`)

- **บทบาท**: ที่ปรึกษาการเงินส่วนบุคคล (Personal Finance Advisor) รองรับไทย/อังกฤษ ไม่ให้คำแนะนำลงทุน/ภาษี/กฎหมายแบบมืออาชีพ
- **โมเดล**: `groq('qwen/qwen3-32b')`
- **Tools**:
  - **budget** (`budget-tool.ts`): แบ่งรายได้สุทธิรายเดือนเป็น needs / wants / savings ตามสัดส่วน (เช่น 50/30/20) คืนจำนวนเงินต่อหมวด
  - **savingsGoal** (`savings-goal-tool.ts`): คำนวณว่าต้องออมเดือนละเท่าไหร่ถึงจะถึงเป้าหมายภายในจำนวนเดือนที่กำหนด (ไม่คิดดอกเบี้ย)
  - **loanCalculator** (`loan-calculator-tool.ts`): คำนวณค่างวดรายเดือนและดอกเบี้ยรวมของเงินกู้ (amortized loan) จาก principal, อัตราดอกเบี้ยรายปี, ระยะเวลา (เดือน)

---

### 6.2 Fitness Agent (`fitness-agent`)

- **บทบาท**: โค้ชฟิตเนส ให้คำแนะนำการออกกำลังกาย โภชนาการพื้นฐาน และการฟื้นตัว แนะนำให้ปรึกษาแพทย์ถ้ามีอาการบาดเจ็บหรือโรค
- **โมเดล**: `groq('openai/gpt-oss-safeguard-20b')`
- **Tools**:
  - **bodyMetrics** (`body-metrics-tool.ts`): คำนวณ BMI, BMR และ TDEE (แคลอรี่ต่อวันโดยประมาณ) จากน้ำหนัก ส่วนสูง อายุ เพศ ระดับกิจกรรม
  - **workoutPlan** (`workout-plan-tool.ts`): สร้างแผนออกกำลังกายต่อเซสชัน ตาม focus (strength/cardio/hiit/ฯลฯ), level, ระยะเวลา, อุปกรณ์, ข้อจำกัด
  - **exerciseInfo** (`exercise-info-tool.ts`): ค้นข้อมูลท่าออกกำลังกาย (รูปแบบการทำ กล้ามเนื้อที่ใช้ อุปกรณ์ ท่าทางเลือก) จากฐานข้อมูลในตัว (เช่น squat, push-up, deadlift, plank)
  - **progression** (`progression-tool.ts`): ให้คำแนะนำเรื่องการเพิ่มน้ำหนัก/reps หรือการโหลดเมื่อไหร่ ตาม goal (strength / hypertrophy / endurance)

---

### 6.3 Study Agent (`study-agent`)

- **บทบาท**: โค้ชการเรียน ช่วยวางแผนอ่านหนังสือ สอบ (เช่น GAT/PAT, TOEIC, IELTS) หรือเรียนด้วยตัวเอง
- **โมเดล**: `groq('qwen/qwen3-32b')`
- **Tools**:
  - **studyPlan** (`study-plan-tool.ts`): สร้างแผนเรียนรายสัปดาห์ แบ่งชั่วโมงตาม topics และจำนวนสัปดาห์จนถึงวันสอบ/เป้าหมาย มีสัปดาห์ทบทวน (optional)
  - **pomodoro** (`pomodoro-tool.ts`): แยกเวลาอ่านเป็นบล็อกโฟกัส + พักสั้น/พักยาว แบบ Pomodoro ตาม total minutes, focus minutes, short/long break, จำนวนบล็อกก่อนพักยาว

---

### 6.4 Travel Agent (`travel-agent`)

- **บทบาท**: ผู้ช่วยวางแผนท่องเที่ยว ไม่ใช่ระบบจอง ไม่รับประกันราคา/ความพร้อม
- **โมเดล**: `groq('qwen/qwen3-32b')`
- **Tools**:
  - **travelPlan** (`travel-plan-tool.ts`): สร้างโครงทริปแบบรายวัน (เช้า/บ่าย/เย็น) ตาม destination, จำนวนวัน, ระดับงบ (low/medium/high), สไตล์ (food, culture, nature, ฯลฯ)
  - **packingList** (`packing-list-tool.ts`): สร้างรายการของที่ต้องพกตามจำนวนวัน สภาพอากาศ (hot/mild/cold/variable) และกิจกรรม (city_walk, beach, hiking, business, ฯลฯ)

---

### 6.5 Weather Agent (`weather-agent`)

- **บทบาท**: ให้ข้อมูลสภาพอากาศและคำแนะนำสั้นๆ ตามผลจาก tool เท่านั้น (ไม่เดา)
- **โมเดล**: `groq('qwen/qwen3-32b')`
- **Tools**:
  - **weather** (`weather-tool.ts`):  
    - ใช้ Open-Meteo Geocoding API แปลงชื่อเมืองเป็นพิกัด  
    - ใช้ Open-Meteo Forecast API ดึงข้อมูลปัจจุบันและ forecast รายวัน  
    - รองรับหน่วย celsius/fahrenheit และจำนวนวัน forecast  
    - `execute` เป็น **async generator** ที่อาจ yield สถานะ `loading` แล้วตามด้วยผล `ready` (หรือ error เช่น `location_not_found`, `weather_unavailable`)

---

## 7. รูปแบบการเรียก API (สรุป)

### Health / ข้อมูลเซิร์ฟเวอร์

```http
GET http://localhost:3010/
GET http://localhost:3010/health
```

Response ตัวอย่าง (โครงสร้าง):

- `server`, `project`, `ok`, `port`
- `agents`: array ของ `{ id, name, chatEndpoint }`
- `endpointPattern`: `POST /api/chat/agent/:agent`

### แชทกับ Agent

```http
POST http://localhost:3010/api/chat/agent/{agent}
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "อยากเก็บเงิน 100,000 ใน 1 ปี ควรออมเดือนละเท่าไหร่" }
  ]
}
```

`{agent}` เป็นหนึ่งใน: `finance`, `fitness`, `study`, `travel`, `weather`

Response เป็น **stream** จาก `createAgentUIStreamResponse` (รูปแบบที่ client ฝั่ง AI SDK/UI รองรับ)

---

## 8. การรันโปรเจกต์

- ติดตั้ง dependencies (ใช้ Bun หรือ pnpm ตามที่โปรเจกต์มี lockfile):
  - `bun install` หรือ `pnpm install`
- ตั้งค่า environment:
  - ใส่ `GROQ_API_KEY` ใน `.env` (หรือ export ใน shell)
- รัน:
  - แบบ watch (development): `bun run dev` → รัน `bun run --watch src/index.ts`
  - แบบ production: `bun run start` → รัน `bun run src/index.ts`

จากนั้นเปิด `http://localhost:3010` หรือเรียก endpoint ตามตารางด้านบน

---

## 9. สรุปการทำงานทั้งหมด

1. **เซิร์ฟเวอร์** รันที่พอร์ต 3010 รับ GET (health) และ POST (แชทต่อ Agent)
2. **Routing** ตรวจสอบ path และเลือก Agent จาก `:agent`
3. **Agent** แต่ละตัวมี instructions + ชุด tools; โมเดลตัดสินใจเรียก tool ตามบทสนทนา
4. **Tools** รัน logic จริง (คำนวณ/เรียก API ภายนอก/ดึงข้อมูลในตัว) แล้วคืนผลให้โมเดล
5. **Stream response** ถูกส่งกลับไปที่ client ผ่าน `createAgentUIStreamResponse`

โปรเจกต์ออกแบบให้ขยายได้โดยการเพิ่ม Agent ใหม่ใน `AGENTS` และเพิ่ม route ที่รองรับ (หรือใช้ pattern เดิมถ้าใช้ `:agent` ต่อ); การเพิ่ม tool ใหม่ทำที่โฟลเดอร์ `src/tool/` แล้วผูกกับ Agent ที่ต้องการในไฟล์ใน `src/agent/`.

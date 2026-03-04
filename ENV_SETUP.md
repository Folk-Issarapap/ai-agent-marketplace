# Environment Variables Setup Guide

## 📁 ตำแหน่งที่ต้องสร้าง .env files

ตามโครงสร้าง Monorepo และ PRD คุณต้องสร้าง `.env` files ในตำแหน่งต่อไปนี้:

---

## 1. Root Level `.env` (สำหรับ shared variables)

**ตำแหน่ง:** `/ai-agent-marketplace/.env`

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ai_agent_marketplace

# Supabase Service Role (สำหรับ backend operations)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**ใช้สำหรับ:**
- `packages/db` - Database connections
- `apps/api` - Backend API (ถ้าไม่ override)
- Shared services

---

## 2. Marketplace App `.env.local` (Next.js)

**ตำแหน่ง:** `/ai-agent-marketplace/apps/marketplace/.env.local`

```bash
# Supabase Auth (Public - exposed to browser)
NEXT_PUBLIC_SUPABASE_URL=https://gdnuhplqnwuyoieiyqco.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_r3HSKGXhOE0KAA5BaCEclA_Ilqfxmmt

# API Endpoint (optional)
# NEXT_PUBLIC_API_URL=http://localhost:3001
```

**ใช้สำหรับ:**
- `apps/marketplace` - Next.js frontend app
- Supabase Auth client-side
- Public API endpoints

**หมายเหตุ:** Next.js จะโหลด `.env.local` อัตโนมัติ และ `NEXT_PUBLIC_*` variables จะถูก expose ไปยัง browser

---

## 3. API Server `.env` (Elysia)

**ตำแหน่ง:** `/ai-agent-marketplace/apps/api/.env`

```bash
# Database (override จาก root หรือใช้ root)
DATABASE_URL=postgresql://user:password@localhost:5432/ai_agent_marketplace

# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase (server-side)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_URL=https://gdnuhplqnwuyoieiyqco.supabase.co

# LLM API Keys (Phase 1+)
# OPENAI_API_KEY=your_openai_key
# ANTHROPIC_API_KEY=your_anthropic_key
```

**ใช้สำหรับ:**
- `apps/api` - Elysia backend API
- Server-side operations
- Database connections
- External API integrations

---

## 4. Admin App `.env.local` (Next.js)

**ตำแหน่ง:** `/ai-agent-marketplace/apps/admin/.env.local`

```bash
# Supabase Auth (เหมือน marketplace)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_publishable_key

# Cloudflare Chat Agent (optional - มี default ในโค้ด)
# NEXT_PUBLIC_CHAT_AGENT_HOST=https://agents-starter.tordb-jwt.workers.dev/agents/chat-agent
```

**ใช้สำหรับ:**
- `apps/admin` - Admin dashboard
- Chat กับ Platform AI Agent (Cloudflare Workers)

---

## 🚀 Quick Setup

### Step 1: สร้าง Root `.env`

```bash
# ที่ root directory
cat > .env << 'EOF'
DATABASE_URL=postgresql://user:password@localhost:5432/ai_agent_marketplace
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
EOF
```

### Step 2: สร้าง Marketplace `.env.local`

```bash
# สร้าง directory ถ้ายังไม่มี
mkdir -p apps/marketplace

# สร้าง .env.local
cat > apps/marketplace/.env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://gdnuhplqnwuyoieiyqco.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_r3HSKGXhOE0KAA5BaCEclA_Ilqfxmmt
EOF
```

### Step 3: สร้าง API `.env` (เมื่อสร้าง apps/api แล้ว)

```bash
# สร้าง directory ถ้ายังไม่มี
mkdir -p apps/api

# สร้าง .env
cat > apps/api/.env << 'EOF'
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/ai_agent_marketplace
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_URL=https://gdnuhplqnwuyoieiyqco.supabase.co
EOF
```

---

## 📝 หมายเหตุสำคัญ

1. **`.env.local` vs `.env`**: 
   - Next.js ใช้ `.env.local` สำหรับ local development
   - `.env.local` ถูก ignore โดย git (ปลอดภัยกว่า)

2. **`NEXT_PUBLIC_*`**: 
   - Variables ที่ขึ้นต้นด้วย `NEXT_PUBLIC_` จะถูก expose ไปยัง browser
   - อย่าใส่ sensitive data ใน `NEXT_PUBLIC_*` variables

3. **Database URL**: 
   - ใช้ format: `postgresql://user:password@host:port/database`
   - สำหรับ local: `postgresql://postgres:password@localhost:5432/ai_agent_marketplace`

4. **Supabase Keys**:
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` - ใช้สำหรับ client-side (ปลอดภัย)
   - `SUPABASE_SERVICE_ROLE_KEY` - ใช้สำหรับ server-side (เก็บเป็นความลับ!)

---

## ✅ Checklist

- [ ] สร้าง root `.env` พร้อม `DATABASE_URL`
- [ ] สร้าง `apps/marketplace/.env.local` พร้อม Supabase credentials
- [ ] (Phase 1+) สร้าง `apps/api/.env` สำหรับ backend API
- [ ] ตั้งค่า PostgreSQL database
- [ ] ตรวจสอบว่า `.env` files ถูก ignore โดย git

---

## 🔒 Security

- ✅ `.env` และ `.env.local` ถูก ignore โดย `.gitignore` แล้ว
- ✅ อย่า commit `.env` files ลง git
- ✅ ใช้ `.env.example` สำหรับ documentation
- ✅ ใช้ environment variables ใน production (Vercel, Railway, etc.)

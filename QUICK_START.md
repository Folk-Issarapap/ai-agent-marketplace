# 🚀 Quick Start Guide

## Step 1: สร้าง Environment Variables

### 1.1 สร้าง Root `.env`

```bash
# ที่ root directory
cat > .env << 'EOF'
DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_agent_marketplace
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
EOF
```

**หรือ** copy จาก template:
```bash
cp .env.template .env
# แล้วแก้ไขค่าใน .env
```

### 1.2 สร้าง Marketplace `.env.local`

```bash
# สร้าง directory ถ้ายังไม่มี
mkdir -p apps/marketplace

# สร้าง .env.local
cat > apps/marketplace/.env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://gdnuhplqnwuyoieiyqco.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_r3HSKGXhOE0KAA5BaCEclA_Ilqfxmmt
EOF
```

**หรือ** copy จาก template:
```bash
cp apps/marketplace/.env.local.template apps/marketplace/.env.local
# แล้วแก้ไขค่าใน .env.local
```

---

## Step 2: Setup Database

### 2.1 สร้าง PostgreSQL Database

```bash
# ใช้ psql หรือ database client
createdb ai_agent_marketplace

# หรือใช้ SQL
psql -U postgres
CREATE DATABASE ai_agent_marketplace;
```

### 2.2 Run Database Migrations

```bash
# ติดตั้ง dependencies ก่อน
pnpm install

# Generate migrations
cd packages/db
pnpm db:generate

# Push schema to database
pnpm db:push

# หรือใช้ migrations
pnpm db:migrate
```

---

## Step 3: ติดตั้ง Dependencies

```bash
# ที่ root directory
pnpm install
```

---

## Step 4: ตรวจสอบ Setup

### 4.1 ตรวจสอบ Database Connection

```bash
cd packages/db
pnpm db:studio
# เปิด browser ไปที่ http://localhost:4983
```

### 4.2 ตรวจสอบ Environment Variables

```bash
# ตรวจสอบ root .env
cat .env

# ตรวจสอบ marketplace .env.local
cat apps/marketplace/.env.local
```

---

## 📝 Checklist

- [ ] สร้าง root `.env` พร้อม `DATABASE_URL`
- [ ] สร้าง `apps/marketplace/.env.local` พร้อม Supabase credentials
- [ ] Setup PostgreSQL database
- [ ] Run database migrations
- [ ] ติดตั้ง dependencies (`pnpm install`)

---

## 🔗 เอกสารเพิ่มเติม

- [ENV_SETUP.md](./ENV_SETUP.md) - รายละเอียด environment variables
- [PRD-FINAL.md](./PRD-FINAL.md) - Product Requirements Document

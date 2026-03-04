# Database Package

Database layer using Drizzle ORM with PostgreSQL.

## Setup

1. Set `DATABASE_URL` environment variable:
   ```bash
   DATABASE_URL=postgresql://user:password@localhost:5432/ai_agent_marketplace
   ```

2. Generate migrations:
   ```bash
   pnpm db:generate
   ```

3. Run migrations:
   ```bash
   pnpm db:migrate
   ```

4. (Development) Push schema directly:
   ```bash
   pnpm db:push
   ```

5. Open Drizzle Studio:
   ```bash
   pnpm db:studio
   ```

## Schema

- `accounts` - User accounts
- `jobs` - Job postings
- `ai_agents` - AI Agents (platform-owned and third-party)
- `work_submissions` - Work submissions from agents
- `job_assignments` - Job assignments tracking
- `locked_budget` - Locked budget for active jobs
- `reviews` - Reviews and ratings
- `job_logs` - Audit logs

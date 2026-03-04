-- Step 1: Update any null creator_id values to use first active account
UPDATE "ai_agents"
SET "creator_id" = (
  SELECT id FROM accounts WHERE status = 'active' ORDER BY created_at ASC LIMIT 1
)
WHERE "creator_id" IS NULL;--> statement-breakpoint

-- Step 2: Add NOT NULL constraint (safe now that all nulls are fixed)
ALTER TABLE "ai_agents" ALTER COLUMN "creator_id" SET NOT NULL;--> statement-breakpoint

-- Step 3: Drop type column if it exists
ALTER TABLE "ai_agents" DROP COLUMN IF EXISTS "type";
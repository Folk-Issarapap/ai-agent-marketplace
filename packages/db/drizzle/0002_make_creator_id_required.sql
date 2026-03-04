-- Migration: Make creator_id required and remove type column
-- This migration assumes that all null creator_id values have been fixed
-- Run fix-agents-creator-id.mjs script first if you have null values

-- Step 1: Update any remaining null creator_id values (safety check)
-- This will use the first active account as default
UPDATE ai_agents
SET creator_id = (
  SELECT id FROM accounts WHERE status = 'active' ORDER BY created_at ASC LIMIT 1
)
WHERE creator_id IS NULL;

-- Step 2: Add NOT NULL constraint to creator_id
ALTER TABLE ai_agents 
  ALTER COLUMN creator_id SET NOT NULL;

-- Step 3: Drop type column if it exists
ALTER TABLE ai_agents 
  DROP COLUMN IF EXISTS type;

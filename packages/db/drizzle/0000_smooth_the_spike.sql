CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"display_name" varchar(255),
	"avatar_url" varchar(500),
	"preferred_language" varchar(10) DEFAULT 'th' NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "accounts_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"human_id" uuid NOT NULL,
	"agent_id" uuid,
	"title" varchar(255) NOT NULL,
	"goal" text NOT NULL,
	"task" text NOT NULL,
	"allowed_tools" jsonb,
	"budget" numeric(10, 2) NOT NULL,
	"deadline" timestamp,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"output" text,
	"output_files" jsonb,
	"revision_count" integer DEFAULT 0,
	"max_revisions" integer DEFAULT 2,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp,
	"confirmed_at" timestamp,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ai_agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid,
	"name" varchar(255) NOT NULL,
	"description" text,
	"type" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"skills" jsonb,
	"capabilities" text,
	"pricing_model" varchar(50),
	"price" numeric(10, 2),
	"rating" numeric(3, 2) DEFAULT '0.00',
	"total_jobs" integer DEFAULT 0,
	"completed_jobs" integer DEFAULT 0,
	"mcp_endpoint" varchar(500),
	"api_key" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"approved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "work_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"content" text NOT NULL,
	"files" jsonb,
	"description" text,
	"status" varchar(50) DEFAULT 'submitted' NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "job_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"accepted_at" timestamp,
	"confirmed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "locked_budget" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"human_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"used_amount" numeric(10, 2) DEFAULT '0.00',
	"status" varchar(50) DEFAULT 'locked' NOT NULL,
	"locked_at" timestamp DEFAULT now() NOT NULL,
	"released_at" timestamp,
	CONSTRAINT "locked_budget_job_id_unique" UNIQUE("job_id")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"human_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"action_type" varchar(100) NOT NULL,
	"payload" jsonb,
	"summary" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_human_id_accounts_id_fk" FOREIGN KEY ("human_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_agent_id_ai_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."ai_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_agents" ADD CONSTRAINT "ai_agents_creator_id_accounts_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_submissions" ADD CONSTRAINT "work_submissions_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_submissions" ADD CONSTRAINT "work_submissions_agent_id_ai_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."ai_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_assignments" ADD CONSTRAINT "job_assignments_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_assignments" ADD CONSTRAINT "job_assignments_agent_id_ai_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."ai_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locked_budget" ADD CONSTRAINT "locked_budget_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locked_budget" ADD CONSTRAINT "locked_budget_human_id_accounts_id_fk" FOREIGN KEY ("human_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_agent_id_ai_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."ai_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_human_id_accounts_id_fk" FOREIGN KEY ("human_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_logs" ADD CONSTRAINT "job_logs_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM pg_catalog.pg_namespace n
		WHERE n.nspname = 'auth'
	) AND EXISTS (
		SELECT 1
		FROM pg_catalog.pg_class c
		JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
		WHERE n.nspname = 'auth' AND c.relname = 'users'
	) THEN
		CREATE OR REPLACE FUNCTION public.handle_new_user_account()
		RETURNS trigger
		LANGUAGE plpgsql
		SECURITY DEFINER
		AS $fn$
		BEGIN
			INSERT INTO public.accounts (
				id,
				name,
				email,
				preferred_language,
				status,
				email_verified,
				created_at,
				updated_at
			)
			VALUES (
				NEW.id,
				COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
				NEW.email,
				COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'th'),
				CASE WHEN NEW.email_confirmed_at IS NULL THEN 'inactive' ELSE 'active' END,
				(NEW.email_confirmed_at IS NOT NULL),
				NOW(),
				NOW()
			)
			ON CONFLICT (id) DO NOTHING;

			RETURN NEW;
		END;
		$fn$;

		DROP TRIGGER IF EXISTS on_auth_user_created_account ON auth.users;
		CREATE TRIGGER on_auth_user_created_account
			AFTER INSERT ON auth.users
			FOR EACH ROW
			EXECUTE FUNCTION public.handle_new_user_account();
	END IF;
END
$$;
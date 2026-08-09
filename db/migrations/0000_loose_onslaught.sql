CREATE TABLE "garmin_daily_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"steps" integer,
	"active_calories" integer,
	"resting_heart_rate" integer,
	"avg_heart_rate" integer,
	"sleep_minutes" integer,
	"raw_payload" jsonb,
	"synced_at" timestamp with time zone NOT NULL,
	CONSTRAINT "garmin_daily_metrics_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "meals" (
	"id" serial PRIMARY KEY NOT NULL,
	"eaten_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"photo_url" text NOT NULL,
	"photo_thumb_url" text,
	"food_name" text NOT NULL,
	"calories" integer NOT NULL,
	"protein_g" numeric,
	"carbs_g" numeric,
	"fat_g" numeric,
	"ai_suggestion" jsonb,
	"ai_confidence" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "weight_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"logged_at" date NOT NULL,
	"weight_kg" numeric NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  timestamp,
  date,
  jsonb,
} from "drizzle-orm/pg-core";

export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  eatenAt: timestamp("eaten_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  photoUrl: text("photo_url").notNull(),
  photoThumbUrl: text("photo_thumb_url"),
  foodName: text("food_name").notNull(),
  calories: integer("calories").notNull(),
  proteinG: numeric("protein_g"),
  carbsG: numeric("carbs_g"),
  fatG: numeric("fat_g"),
  aiSuggestion: jsonb("ai_suggestion"),
  aiConfidence: text("ai_confidence"),
  notes: text("notes"),
});

export const weightLogs = pgTable("weight_logs", {
  id: serial("id").primaryKey(),
  loggedAt: date("logged_at").notNull(),
  weightKg: numeric("weight_kg").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const garminDailyMetrics = pgTable("garmin_daily_metrics", {
  id: serial("id").primaryKey(),
  date: date("date").notNull().unique(),
  steps: integer("steps"),
  activeCalories: integer("active_calories"),
  restingHeartRate: integer("resting_heart_rate"),
  avgHeartRate: integer("avg_heart_rate"),
  sleepMinutes: integer("sleep_minutes"),
  rawPayload: jsonb("raw_payload"),
  syncedAt: timestamp("synced_at", { withTimezone: true }).notNull(),
});

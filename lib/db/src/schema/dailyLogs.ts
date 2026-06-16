import { pgTable, serial, text, integer, jsonb, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const dailyLogsTable = pgTable("daily_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: date("date").notNull(),
  entries: jsonb("entries").notNull().$type<{
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    meal: "breakfast" | "lunch" | "dinner" | "snack";
    time: string;
  }[]>(),
  water: integer("water").notNull().default(0),
  totalCalories: integer("total_calories").notNull().default(0),
  totalProtein: integer("total_protein").notNull().default(0),
  totalCarbs: integer("total_carbs").notNull().default(0),
  totalFats: integer("total_fats").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export const insertDailyLogSchema = createInsertSchema(dailyLogsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDailyLog = z.infer<typeof insertDailyLogSchema>;
export type DailyLogRow = typeof dailyLogsTable.$inferSelect;

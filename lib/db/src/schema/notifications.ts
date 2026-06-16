import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(), // friend_request, friend_accepted, daily_reminder, goal_met, goal_behind
  title: text("title").notNull(),
  body: text("body").notNull(),
  data: text("data"), // JSON string for extra data
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  expiresAt: timestamp("expires_at", { mode: "date" }), // auto-delete after 7 days
});

export const insertNotificationSchema = createInsertSchema(notificationsTable).omit({ id: true, createdAt: true });
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type NotificationRow = typeof notificationsTable.$inferSelect;

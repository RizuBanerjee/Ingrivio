import { pgTable, text, timestamp, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),       // e.g. #12d5fsc6
  firebaseUid: text("firebase_uid").notNull().unique(),
  username: text("username").notNull(),
  email: text("email").notNull(),
  avatar: text("avatar"),                           // emoji or URL
  age: integer("age").default(28),
  height: integer("height").default(170),
  weight: integer("weight").default(70),
  gender: text("gender").default("other"),
  goal: text("goal").default("maintain"),
  dietary: text("dietary").array(),
  calorieGoal: integer("calorie_goal").default(2000),
  proteinGoal: integer("protein_goal").default(150),
  carbsGoal: integer("carbs_goal").default(225),
  fatsGoal: integer("fats_goal").default(65),
  waterGoal: integer("water_goal").default(8),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserRow = typeof usersTable.$inferSelect;

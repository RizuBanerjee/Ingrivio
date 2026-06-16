import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const friendsTable = pgTable("friends", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  friendId: text("friend_id").notNull(),
  friendUsername: text("friend_username").notNull(),
  friendAvatar: text("friend_avatar"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const insertFriendSchema = createInsertSchema(friendsTable).omit({ id: true, createdAt: true });
export type InsertFriend = z.infer<typeof insertFriendSchema>;
export type FriendRow = typeof friendsTable.$inferSelect;

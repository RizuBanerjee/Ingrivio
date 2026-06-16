import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const friendRequestsTable = pgTable("friend_requests", {
  id: serial("id").primaryKey(),
  senderId: text("sender_id").notNull(),      // user_id of sender
  senderUsername: text("sender_username").notNull(),
  receiverId: text("receiver_id").notNull(),  // user_id of receiver
  receiverUsername: text("receiver_username").notNull(),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export const insertFriendRequestSchema = createInsertSchema(friendRequestsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertFriendRequest = z.infer<typeof insertFriendRequestSchema>;
export type FriendRequestRow = typeof friendRequestsTable.$inferSelect;

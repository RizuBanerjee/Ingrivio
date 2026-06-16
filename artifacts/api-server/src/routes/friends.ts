import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, friendRequestsTable, friendsTable } from "@workspace/db/schema";
import { eq, and, or } from "drizzle-orm";

const router: IRouter = Router();

// POST /api/friends/request — send friend request
router.post("/friends/request", async (req, res) => {
  const { senderId, receiverId } = req.body;
  if (!senderId || !receiverId) {
    res.status(400).json({ error: "Missing senderId or receiverId" });
    return;
  }
  try {
    // Check both users exist
    const sender = await db.select().from(usersTable).where(eq(usersTable.userId, senderId)).limit(1);
    const receiver = await db.select().from(usersTable).where(eq(usersTable.userId, receiverId)).limit(1);
    if (sender.length === 0 || receiver.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    // Check if already friends
    const existingFriend = await db.select().from(friendsTable).where(
      and(
        eq(friendsTable.userId, senderId),
        eq(friendsTable.friendId, receiverId)
      )
    ).limit(1);
    if (existingFriend.length > 0) {
      res.json({ message: "Already friends", alreadyFriends: true });
      return;
    }
    // Check if request already pending
    const existingRequest = await db.select().from(friendRequestsTable).where(
      and(
        eq(friendRequestsTable.senderId, senderId),
        eq(friendRequestsTable.receiverId, receiverId),
        eq(friendRequestsTable.status, "pending")
      )
    ).limit(1);
    if (existingRequest.length > 0) {
      res.json({ message: "Friend request already sent", alreadySent: true });
      return;
    }
    // Create request
    await db.insert(friendRequestsTable).values({
      senderId,
      senderUsername: sender[0].username,
      receiverId,
      receiverUsername: receiver[0].username,
      status: "pending",
    });
    res.json({ success: true, message: "Friend request sent" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to send request" });
  }
});

// POST /api/friends/accept — accept friend request
router.post("/friends/accept", async (req, res) => {
  const { requestId, userId } = req.body;
  if (!requestId || !userId) {
    res.status(400).json({ error: "Missing requestId or userId" });
    return;
  }
  try {
    const reqRows = await db.select().from(friendRequestsTable).where(eq(friendRequestsTable.id, Number(requestId))).limit(1);
    if (reqRows.length === 0) {
      res.status(404).json({ error: "Request not found" });
      return;
    }
    const fr = reqRows[0];
    if (fr.receiverId !== userId) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }
    // Update request status
    await db.update(friendRequestsTable).set({ status: "accepted", updatedAt: new Date() }).where(eq(friendRequestsTable.id, Number(requestId)));
    // Create both friend entries
    await db.insert(friendsTable).values({
      userId: fr.senderId,
      friendId: fr.receiverId,
      friendUsername: fr.receiverUsername,
      friendAvatar: "",
    });
    await db.insert(friendsTable).values({
      userId: fr.receiverId,
      friendId: fr.senderId,
      friendUsername: fr.senderUsername,
      friendAvatar: "",
    });
    res.json({ success: true, message: "Friend request accepted" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to accept request" });
  }
});

// POST /api/friends/reject — reject friend request
router.post("/friends/reject", async (req, res) => {
  const { requestId, userId } = req.body;
  if (!requestId || !userId) {
    res.status(400).json({ error: "Missing requestId or userId" });
    return;
  }
  try {
    const reqRows = await db.select().from(friendRequestsTable).where(eq(friendRequestsTable.id, Number(requestId))).limit(1);
    if (reqRows.length === 0) {
      res.status(404).json({ error: "Request not found" });
      return;
    }
    const fr = reqRows[0];
    if (fr.receiverId !== userId) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }
    await db.update(friendRequestsTable).set({ status: "rejected", updatedAt: new Date() }).where(eq(friendRequestsTable.id, Number(requestId)));
    res.json({ success: true, message: "Friend request rejected" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to reject request" });
  }
});

// GET /api/friends/requests?userId=xxx
router.get("/friends/requests", async (req, res) => {
  const { userId } = req.query;
  if (!userId || typeof userId !== "string") {
    res.status(400).json({ error: "Missing userId" });
    return;
  }
  try {
    const sent = await db.select().from(friendRequestsTable)
      .where(and(eq(friendRequestsTable.senderId, userId), eq(friendRequestsTable.status, "pending")));
    const received = await db.select().from(friendRequestsTable)
      .where(and(eq(friendRequestsTable.receiverId, userId), eq(friendRequestsTable.status, "pending")));
    res.json({ sent, received });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

// GET /api/friends?userId=xxx
router.get("/friends", async (req, res) => {
  const { userId } = req.query;
  if (!userId || typeof userId !== "string") {
    res.status(400).json({ error: "Missing userId" });
    return;
  }
  try {
    const rows = await db.select().from(friendsTable).where(eq(friendsTable.userId, userId));
    res.json({ friends: rows });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch friends" });
  }
});

// POST /api/friends/remove — remove friend
router.post("/friends/remove", async (req, res) => {
  const { userId, friendId } = req.body;
  if (!userId || !friendId) {
    res.status(400).json({ error: "Missing userId or friendId" });
    return;
  }
  try {
    await db.delete(friendsTable).where(
      or(
        and(eq(friendsTable.userId, userId), eq(friendsTable.friendId, friendId)),
        and(eq(friendsTable.userId, friendId), eq(friendsTable.friendId, userId))
      )
    );
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to remove friend" });
  }
});

export default router;

import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db/schema";
import { eq, and, lt, sql } from "drizzle-orm";

const router: IRouter = Router();

// POST /api/notifications — create notification
router.post("/notifications", async (req, res) => {
  const { userId, type, title, body, data } = req.body;
  if (!userId || !type || !title || !body) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const inserted = await db.insert(notificationsTable).values({
      userId,
      type,
      title,
      body,
      data: data ? JSON.stringify(data) : null,
      expiresAt,
    }).returning();
    res.json({ notification: inserted[0] });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create notification" });
  }
});

// GET /api/notifications?userId=xxx
router.get("/notifications", async (req, res) => {
  const { userId } = req.query;
  if (!userId || typeof userId !== "string") {
    res.status(400).json({ error: "Missing userId" });
    return;
  }
  try {
    // Clean up expired notifications
    await db.delete(notificationsTable).where(
      and(eq(notificationsTable.userId, userId), lt(notificationsTable.expiresAt, new Date()))
    );
    const rows = await db.select().from(notificationsTable)
      .where(eq(notificationsTable.userId, userId))
      .orderBy(sql`${notificationsTable.createdAt} DESC`);
    res.json({ notifications: rows });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// PUT /api/notifications/:id/read
router.put("/notifications/:id/read", async (req, res) => {
  const { id } = req.params;
  try {
    await db.update(notificationsTable).set({ read: true }).where(eq(notificationsTable.id, Number(id)));
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

// POST /api/notifications/cleanup — clean all expired (can be called by cron)
router.post("/notifications/cleanup", async (req, res) => {
  try {
    const result = await db.delete(notificationsTable).where(
      lt(notificationsTable.expiresAt, new Date())
    );
    res.json({ deleted: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to cleanup notifications" });
  }
});

export default router;

import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, friendRequestsTable, friendsTable } from "@workspace/db/schema";
import { eq, or, and, sql } from "drizzle-orm";

const router: IRouter = Router();

function generateUserId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "#";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function ensureUniqueUserId(): Promise<string> {
  let id = generateUserId();
  let attempts = 0;
  while (attempts < 10) {
    const existing = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.userId, id)).limit(1);
    if (existing.length === 0) return id;
    id = generateUserId();
    attempts++;
  }
  throw new Error("Could not generate unique userId");
}

// POST /api/users — create or update user
router.post("/users", async (req, res) => {
  const { firebaseUid, username, email } = req.body;
  if (!firebaseUid || !username || !email) {
    res.status(400).json({ error: "Missing firebaseUid, username, or email" });
    return;
  }
  try {
    const existing = await db.select().from(usersTable).where(eq(usersTable.firebaseUid, firebaseUid)).limit(1);
    if (existing.length > 0) {
      const user = existing[0];
      res.json({ user });
      return;
    }
    const userId = await ensureUniqueUserId();
    await db.insert(usersTable).values({
      userId,
      firebaseUid,
      username,
      email,
      dietary: [],
    });
    const inserted = await db.select().from(usersTable).where(eq(usersTable.firebaseUid, firebaseUid)).limit(1);
    res.json({ user: inserted[0] });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// GET /api/users/me?firebaseUid=xxx
router.get("/users/me", async (req, res) => {
  const { firebaseUid } = req.query;
  if (!firebaseUid || typeof firebaseUid !== "string") {
    res.status(400).json({ error: "Missing firebaseUid" });
    return;
  }
  try {
    const rows = await db.select().from(usersTable).where(eq(usersTable.firebaseUid, firebaseUid)).limit(1);
    if (rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ user: rows[0] });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// GET /api/users/:userId — public profile (for friend viewing)
router.get("/users/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const rows = await db.select({
      userId: usersTable.userId,
      username: usersTable.username,
      avatar: usersTable.avatar,
      age: usersTable.age,
      height: usersTable.height,
      weight: usersTable.weight,
      gender: usersTable.gender,
      goal: usersTable.goal,
      dietary: usersTable.dietary,
      calorieGoal: usersTable.calorieGoal,
      proteinGoal: usersTable.proteinGoal,
      carbsGoal: usersTable.carbsGoal,
      fatsGoal: usersTable.fatsGoal,
      waterGoal: usersTable.waterGoal,
    }).from(usersTable).where(eq(usersTable.userId, userId)).limit(1);
    if (rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ user: rows[0] });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// POST /api/users/:userId — update profile (use POST for body compatibility)
router.post("/users/:userId", async (req, res) => {
  const { userId } = req.params;
  const updates = req.body;
  try {
    await db.update(usersTable).set({ ...updates, updatedAt: new Date() }).where(eq(usersTable.userId, userId));
    const rows = await db.select().from(usersTable).where(eq(usersTable.userId, userId)).limit(1);
    res.json({ user: rows[0] });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// GET /api/users/search?query=#xxx
router.get("/users/search", async (req, res) => {
  const { query } = req.query;
  if (!query || typeof query !== "string") {
    res.status(400).json({ error: "Missing query" });
    return;
  }
  const normalized = query.trim().toLowerCase();
  try {
    const rows = await db.select({
      userId: usersTable.userId,
      username: usersTable.username,
      avatar: usersTable.avatar,
    }).from(usersTable).where(
      or(
        sql`LOWER(${usersTable.userId}) = ${normalized}`,
        sql`LOWER(${usersTable.userId}) = ${"#" + normalized.replace("#", "")}`,
      )
    ).limit(1);
    if (rows.length === 0) {
      res.json({ found: false });
      return;
    }
    res.json({ found: true, user: rows[0] });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to search user" });
  }
});

export default router;

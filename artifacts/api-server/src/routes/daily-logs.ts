import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { dailyLogsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

// GET /api/daily-logs?userId=xxx&date=YYYY-MM-DD
router.get("/daily-logs", async (req, res) => {
  const { userId, date } = req.query;
  if (!userId || !date || typeof userId !== "string" || typeof date !== "string") {
    res.status(400).json({ error: "Missing userId or date" });
    return;
  }
  try {
    const rows = await db
      .select()
      .from(dailyLogsTable)
      .where(and(eq(dailyLogsTable.userId, userId), eq(dailyLogsTable.date, date)))
      .limit(1);
    if (rows.length === 0) {
      res.json({
        date,
        userId,
        entries: [],
        water: 0,
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFats: 0,
      });
      return;
    }
    const row = rows[0];
    res.json({
      date: row.date,
      userId: row.userId,
      entries: row.entries,
      water: row.water,
      totalCalories: row.totalCalories,
      totalProtein: row.totalProtein,
      totalCarbs: row.totalCarbs,
      totalFats: row.totalFats,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch daily log" });
  }
});

// POST /api/daily-logs
router.post("/daily-logs", async (req, res) => {
  const { userId, date, entries, water, totalCalories, totalProtein, totalCarbs, totalFats } = req.body;
  if (!userId || !date || !entries || typeof userId !== "string" || typeof date !== "string") {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  try {
    const existing = await db
      .select({ id: dailyLogsTable.id })
      .from(dailyLogsTable)
      .where(and(eq(dailyLogsTable.userId, userId), eq(dailyLogsTable.date, date)))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(dailyLogsTable)
        .set({
          entries,
          water: water ?? 0,
          totalCalories: totalCalories ?? 0,
          totalProtein: totalProtein ?? 0,
          totalCarbs: totalCarbs ?? 0,
          totalFats: totalFats ?? 0,
          updatedAt: new Date(),
        })
        .where(eq(dailyLogsTable.id, existing[0].id));
      res.json({ success: true, updated: true });
    } else {
      await db.insert(dailyLogsTable).values({
        userId,
        date,
        entries,
        water: water ?? 0,
        totalCalories: totalCalories ?? 0,
        totalProtein: totalProtein ?? 0,
        totalCarbs: totalCarbs ?? 0,
        totalFats: totalFats ?? 0,
      });
      res.json({ success: true, created: true });
    }
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to save daily log" });
  }
});

export default router;

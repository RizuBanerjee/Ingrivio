import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aiRouter from "./ai";
import dailyLogsRouter from "./daily-logs";

const router: IRouter = Router();

router.use(healthRouter);
router.use(aiRouter);
router.use(dailyLogsRouter);

export default router;

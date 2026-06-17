import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aiRouter from "./ai";
import dailyLogsRouter from "./daily-logs";
import usersRouter from "./users";
import friendsRouter from "./friends";
import notificationsRouter from "./notifications";
import savedRecipesRouter from "./saved-recipes";

const router: IRouter = Router();

router.use(healthRouter);
router.use(aiRouter);
router.use(dailyLogsRouter);
router.use(usersRouter);
router.use(friendsRouter);
router.use(notificationsRouter);
router.use(savedRecipesRouter);

export default router;

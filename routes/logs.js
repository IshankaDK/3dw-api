import { Router } from "express";
import { isAdmin, statusCheck } from "../middlewares/statusCheck.js";
import { jwtVerify } from "../middlewares/jwtVerify.js";
import { sessionVerify } from "../middlewares/sessionVerify.js";
import { allLogs, logsOf, deleteAllLogs, deleteLogs } from "../controllers/logController.js";

const router = Router();

router.use(jwtVerify);
router.use(sessionVerify);
router.use(statusCheck);
router.use(isAdmin);

router.get("/allLogs", allLogs);
router.get("/logsOf", logsOf);
router.delete("/deleteAllLogs", deleteAllLogs);
router.delete("/deleteLogs", deleteLogs);

export default router;

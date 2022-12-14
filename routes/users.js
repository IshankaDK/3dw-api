import { Router } from "express";
import {
	login,
	newUser,
	stillAlive,
	onlineUsers,
	newUsersSinceLastVisit,
	logout,
	lastVisitors,
	lastRegisteredUsers,
	deleteInactiveUsers,
	usersTable,
	userData,
	updateUser,
	usersAwaitingActivation,
	activateUser,
	currentSessions,
	deleteSessions,
	currentGroups,
	deleteAllSessions,
	usersCount,
} from "../controllers/userController.js";
import { jwtVerify } from "../middlewares/jwtVerify.js";
import { sessionVerify } from "../middlewares/sessionVerify.js";
import { statusCheck, isAdmin } from "../middlewares/statusCheck.js";

const router = Router();

// Any user can try login

router.post("/login", login);

router.use(jwtVerify);
router.use(sessionVerify);
router.use(statusCheck);

// Only logged in users access

router.post("/logout", logout);
router.put("/stillAlive", stillAlive);

router.use(isAdmin);

// Only admin can access

router.post("/newUser", newUser);//called
router.get("/onlineUsers", onlineUsers);//called
router.get("/newUsersSinceLastVisit", newUsersSinceLastVisit);
router.get("/lastVisitors", lastVisitors);//called
router.get("/lastRegisteredUsers", lastRegisteredUsers);//called
router.delete("/deleteInactiveUsers", deleteInactiveUsers);
router.get("/usersTable", usersTable);//called
router.get("/usersCount", usersCount);//called
router.get("/userData/:user_id", userData);//called
router.put("/updateUser", updateUser);
router.get("/usersAwaitingActivation", usersAwaitingActivation);
router.put("/activateUser", activateUser);
router.get("/currentSessions", currentSessions);
router.delete("/deleteSessions", deleteSessions);
router.delete("/deleteAllSessions", deleteAllSessions);
router.get("/currentGroups", currentGroups);

export default router;

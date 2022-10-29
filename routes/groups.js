import { Router } from "express";
import { createGroup, groupData, deleteGroup, addUser, deleteUser } from "../controllers/groupController.js";
import { isAdmin, statusCheck } from "../middlewares/statusCheck.js";
import { jwtVerify } from "../middlewares/jwtVerify.js";
import { sessionVerify } from "../middlewares/sessionVerify.js";

const router = Router();

router.use(jwtVerify);
router.use(sessionVerify);
router.use(statusCheck);
router.use(isAdmin);

router.post("/createGroup", createGroup);
router.get("/groupData", groupData);
router.delete("/deleteGroup", deleteGroup);
router.post("/addUser", addUser);
router.delete("/deleteUser", deleteUser);

export default router;

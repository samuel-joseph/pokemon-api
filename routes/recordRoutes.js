import express from "express";
import * as recordController from "../controllers/recordController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticate, recordController.addRecord);
router.get("/", recordController.getRecord);
router.get("/:name", authenticate, recordController.getRecord);
router.put("/:name", authenticate, recordController.updateRecord);
router.delete("/:name", authenticate, recordController.deleteRecord);
router.put("/:name/update/:region", recordController.incrementRegionWin);

export default router;

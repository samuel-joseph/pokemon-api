import express from "express";
import * as recordController from "../controllers/recordController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get("/", recordController.getRecord);
router.get("/:name", authenticate, recordController.getRecord);
router.delete("/:name", authenticate, recordController.deleteRecord);
router.put(
  "/:name/update/:region",
  authenticate,
  recordController.incrementRegionWin
);
router.put("/:name", authenticate, recordController.addRecordItem);

// addRecordItem;

export default router;

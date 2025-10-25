import express from "express";
import * as narrateController from "../controllers/narrateController.js";

const router = express.Router();

router.post("/comentate", narrateController.narrateBattle);

export default router;

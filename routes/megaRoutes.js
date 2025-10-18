import express from "express";
import * as megaController from "../controllers/megaController.js";

const router = express.Router();

router.get("/", megaController.getMega);
router.get("/:name", megaController.getMega);

export default router;

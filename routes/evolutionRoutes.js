import express from "express";
import * as evolutionController from "../controllers/evolutionController.js";
const router = express.Router();

router.get("/:id", evolutionController.getEvolutionById);
export default router;

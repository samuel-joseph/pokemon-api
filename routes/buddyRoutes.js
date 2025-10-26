import express from "express";
import * as buddyController from "../controllers/buddyController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get("/:name", buddyController.getTrainerPokemon);
router.put("/:name", authenticate, buddyController.addTrainerPokemon);
router.put(
  "/:name/pokemon/:pokemonName/levelup",
  authenticate,
  buddyController.levelUpTrainerPokemon
);
router.put(
  "/:name/pokemon/:pokemonName/experience",
  authenticate,
  buddyController.addExperienceToPokemon
);

// routes/buddyRoutes.js
router.put("/:name/pokemon", authenticate, buddyController.editTrainerPokemon);

export default router;

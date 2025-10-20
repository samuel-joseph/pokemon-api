import express from "express";
import * as pokemonController from "../controllers/pokemonControllers.js";

const router = express.Router();

// Get all Pokémon
router.get("/pokemon", pokemonController.getAllPokemons);

// Get a single Pokémon by ID
router.get("/pokemon/:id", pokemonController.getAllPokemons);

// Get Pokémon by region
router.get("/region/:regionId", pokemonController.getRegionPokemons);

// Get all moves
router.get("/move", pokemonController.getAllMoves);

// Get a single move by ID
router.get("/move/:id", pokemonController.getAllMoves);

// Get all NPCs
router.get("/npc", pokemonController.getNpc);

// Get single NPC by ID
router.get("/npc/:id", pokemonController.getNpc);

// Pokémon battle narration
router.post("/ai/comentate", pokemonController.narrateBattle);



export default router; // ✅ ESM export

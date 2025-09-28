const express = require("express");
const router = express.Router();
const pokemonController = require("../controllers/pokemonControllers");

// Get all Pokémon
router.get("/pokemon", pokemonController.getAllPokemons);

// Get a single Pokémon by ID
router.get("/pokemon/:id", pokemonController.getAllPokemons);

// Get Pokémon by region
router.get("/region/:regionId", pokemonController.getRegionPokemons);

router.get("/move/:id", pokemonController.getAllMoves);

router.get("/move", pokemonController.getAllMoves);

module.exports = router;

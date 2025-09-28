const express = require("express");
const router = express.Router();
const pokemonController = require("../controllers/pokemonControllers");

// Route to get all Pokémon
router.get("/pokemon", pokemonController.getPokemons);

// Route to get a specific Pokémon by ID
// router.get("/pokemon/:id", pokemonController.getPokemonById);

// router.get("/move", pokemonController.getAllMoves);

// // Route to get a specific move by ID
// router.get("/move/:id", pokemonController.getMoveById);

module.exports = router;

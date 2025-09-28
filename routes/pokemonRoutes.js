const express = require("express");
const router = express.Router();
const pokemonController = require("../controllers/pokemonControllers");
const { loadData, fetchNextBatch } = require("../services/pokemonServices");

// Route to get all Pokémon
router.get("/pokemon", async (req, res) => {
  const data = loadData();

  // If we haven't fetched all 905 Pokémon yet, fetch the next batch asynchronously
  if (data.pokemons.length < 905) {
    fetchNextBatch()
      .then((updatedData) => {
        const total = 905;
        const fetched = updatedData.pokemons.length;
        const percentage = ((fetched / total) * 100).toFixed(2);
        console.log(
          `Progress: ${fetched}/${total} Pokémon fetched (${percentage}%)`
        );
      })
      .catch((err) => console.error("Error fetching next batch:", err.message));
  }

  // Return the current data (may be partial at first)
  res.json(data);
});

// Route to get a specific Pokémon by ID (optional)
// router.get("/pokemon/:id", pokemonController.getPokemonById);

// Route to get all moves (optional)
// router.get("/move", pokemonController.getAllMoves);

// Route to get a specific move by ID (optional)
// router.get("/move/:id", pokemonController.getMoveById);

module.exports = router;

const fs = require("fs");
const path = require("path");
const express = require("express");

const { fetchNextBatch } = require("./services/pokemonServices");
const { fetchAllMoves } = require("./script/fetchMoves");

const MOVES_FILE = path.join(__dirname, "moves.json");
const POKEMON_FILE = path.join(__dirname, "pokemon.json");

// ------------------------
// Ensure moves.json exists
// ------------------------
async function ensureMoves() {
  if (!fs.existsSync(MOVES_FILE)) {
    console.log("moves.json not found. Generating in background...");
    try {
      await fetchAllMoves();
      console.log("✅ moves.json generated.");
    } catch (err) {
      console.error("❌ Failed to generate moves.json:", err);
    }
  } else {
    console.log("moves.json found. Skipping generation.");
  }
}

// ------------------------
// Incremental Pokémon fetching
// ------------------------
function startIncrementalPokemon() {
  if (!fs.existsSync(POKEMON_FILE)) {
    console.log("pokemon.json not found. Starting incremental generation...");
  } else {
    console.log(
      "pokemon.json found. Incremental generation will continue if incomplete."
    );
  }

  const interval = setInterval(async () => {
    try {
      const data = await fetchNextBatch();
      if (data.pokemons.length >= 621) {
        console.log("✅ All 905 Pokémon have been fetched!");
        clearInterval(interval);
      }
    } catch (err) {
      console.error("❌ Error fetching Pokémon batch:", err);
    }
  }, 5000); // every 5 seconds
}

// ------------------------
// Server startup
// ------------------------
function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use("/api", require("./routes/pokemonRoutes"));

  app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);

    // Background tasks
    ensureMoves().catch(console.error);
    startIncrementalPokemon();
  });
}

// Start server
startServer();

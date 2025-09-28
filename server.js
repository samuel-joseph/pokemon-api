const fs = require("fs");
const path = require("path");
const express = require("express");

const { fetchNextBatch } = require("./services/pokemonServices");
const { fetchAllMoves } = require("./script/fetchMoves"); // if moves are generated separately

const MOVES_FILE = path.join(__dirname, "moves.json");
const POKEMON_FILE = path.join(__dirname, "pokemon.json");

async function ensureMoves() {
  if (!fs.existsSync(MOVES_FILE)) {
    console.log("moves.json not found. Generating...");
    await fetchAllMoves();
    console.log("✅ moves.json generated.");
  }
}

// ------------------------
// Server startup
// ------------------------
async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Routes
  app.use("/api", require("./routes/pokemonRoutes"));

  app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
  });

  // Generate moves if missing
  await ensureMoves();

  // Start incremental Pokémon fetching in the background
  if (!fs.existsSync(POKEMON_FILE)) {
    console.log("pokemon.json not found. Starting incremental generation...");
  } else {
    console.log(
      "pokemon.json found. Incremental generation will continue in background if incomplete."
    );
  }

  const interval = setInterval(async () => {
    const data = await fetchNextBatch();
    if (data.pokemons.length >= 905) {
      console.log("✅ All 905 Pokémon have been fetched!");
      clearInterval(interval);
    }
  }, 5000); // fetch next batch every 5 seconds
}

// Start the server immediately
startServer().catch((err) => console.error(err));

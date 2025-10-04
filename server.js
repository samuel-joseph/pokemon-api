const fs = require("fs");
const path = require("path");
const express = require("express");
const { fetchNextBatch } = require("./services/pokemonServices");
const { fetchAllMoves } = require("./script/fetchMoves");
const { buildNpcData } = require("./script/buildNpc");

// Path constants
const MOVES_FILE = path.join(__dirname, "data/moves.json");
const POKEMON_FILE = path.join(__dirname, "data/pokemon.json");
const NPC_FILE = path.join(__dirname, "data/npc.json");

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
// Ensure npc.json exists
// ------------------------
async function ensureNpc() {
  if (!fs.existsSync(NPC_FILE)) {
    console.log("npc.json not found. Generating...");
    try {
      // Import and run the buildNpc script
      await buildNpcData(); // Make sure buildNpc exports a function returning a promise
      console.log("✅ npc.json generated.");
    } catch (err) {
      console.error("❌ Failed to generate npc.json:", err);
    }
  } else {
    console.log("npc.json found. Skipping generation.");
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
      if (data.pokemons.length >= 905) {
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
async function startServer() {
  const app = express();
  app.cors = require("cors");
  app.use(app.cors());
  const PORT = process.env.PORT || 3000;

  app.use("/api", require("./routes/pokemonRoutes"));

  app.get("/healthz", (req, res) => res.status(200).send("ok"));

  app.listen(PORT, async () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);

    // Background tasks
    await ensureMoves(); // <-- ensure npc.json exists before using it
    startIncrementalPokemon();
    await ensureNpc();
  });
}

// Start server
startServer();

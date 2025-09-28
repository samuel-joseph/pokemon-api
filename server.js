const fs = require("fs");
const path = require("path");
const { fetchAndStoreData } = require("./services/pokemonServices");
const { fetchAllMoves } = require("./script/fetchMoves"); // if moves are generated separately

const MOVES_FILE = path.join(__dirname, "moves.json");
const POKEMON_FILE = path.join(__dirname, "pokemon.json");

async function ensureData() {
  // 1. Generate moves.json if missing
  if (!fs.existsSync(MOVES_FILE)) {
    console.log("moves.json not found. Generating...");
    await fetchAllMoves(); // your moves script function
  }

  // 2. Generate pokemon.json if missing
  if (!fs.existsSync(POKEMON_FILE)) {
    console.log("pokemon.json not found. Generating...");
    await fetchAndStoreData();
  }
}

// Call it before starting the server
ensureData().then(() => {
  const express = require("express");
  const app = express();
  const port = 3000;

  // Your routes here
  const pokemonRoutes = require("./routes/pokemonRoutes");
  app.use("/pokemon", pokemonRoutes);

  app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
  });
});

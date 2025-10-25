import fs from "fs";
import path from "path";
import express from "express";
import { fetchNextBatch } from "./services/pokemonServices.js";
import { fetchAllMoves } from "./script/fetchMoves.js";
import { buildNpcData } from "./script/buildNpc.js";
import { generateEvolutionChart } from "./script/evolutionChart.js";
import bodyParser from "body-parser";
import cors from "cors";
import pokemonRoutes from "./routes/pokemonRoutes.js";
import recordRoutes from "./routes/recordRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import megaRoutes from "./routes/megaRoutes.js";
import buddyRoutes from "./routes/buddyRoutes.js";
import evolutionRoutes from "./routes/evolutionRoutes.js";
import narrateRoutes from "./routes/narrateRoutes.js";
// import { MongoClient, ServerApiVersion } from "mongodb";
import mongoose from "mongoose";

import { fileURLToPath } from "url";
import { generateMegaData } from "./script/generateMegaData.js";

// Compute __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path constants
const MOVES_FILE = path.join(__dirname, "data/moves.json");
const POKEMON_FILE = path.join(__dirname, "data/pokemon.json");
const NPC_FILE = path.join(__dirname, "data/npc.json");
const LEADERBOARD_FILE = path.join(__dirname, "data/leaderboard.json");

// ------------------------
// Ensure moves.json exists
// ------------------------
const ensureMoves = async () => {
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
};

const ensureLeaderboards = async () => {
  if (!fs.existsSync(LEADERBOARD_FILE)) {
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify([], null, 2));
    console.log("✅ leaderboard.json created");
  }
};

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
  // app.cors = require("cors");
  app.use(
    cors({
      origin: [
        "http://localhost:5173",
        "https://pokemon-react-weld-sigma.vercel.app",
      ],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("mongodb connected");
    })
    .catch((err) => {
      console.error(err);
    });

  const PORT = process.env.PORT || 3000;

  app.use(bodyParser.json());
  app.use(express.json({ limit: "5mb" })); 
  app.use(express.urlencoded({ limit: "5mb", extended: true }));
  app.use(bodyParser.urlencoded({ extended: true }));
  // app.use("/api", require("./routes/pokemonRoutes"));
  app.use("/api", pokemonRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/record", recordRoutes);
  app.use("/api/mega", megaRoutes);
  app.use("/api/buddy", buddyRoutes);
  app.use("/api/evolution", evolutionRoutes);
  app.use("/api/ai", narrateRoutes);

  app.get("/healthz", (req, res) => res.status(200).send("ok"));

  app.listen(PORT, async () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);

    // Background tasks
    await generateMegaData();
    await ensureMoves(); // <-- ensure npc.json exists before using it
    startIncrementalPokemon();
    await ensureNpc();
    await generateEvolutionChart();
  });
}

// Start server
startServer();

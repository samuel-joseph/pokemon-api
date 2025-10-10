// const {
//   loadData,
//   loadMoves,
//   loadNpc,
//   loadLeaderboard,
//   fetchNextBatch,
//   saveLeaderboard,
// } = require("../services/pokemonServices");
// const {
//   getRegionPokemons: getRegionPokemonsService,
// } = require("../services/regionService");

import {
  loadData,
  loadMoves,
  loadNpc,
  loadLeaderboard,
  fetchNextBatch,
  saveLeaderboard,
} from "../services/pokemonServices.js";
import { getRegionPokemons as getRegionPokemonsService } from "../services/regionService.js";

import dotenv from "dotenv";
dotenv.config();

// import { GoogleGenAI } from "@google/genai";

import OpenAI from "openai";

const ai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

// ------------------------
// Get all Pokémon
// ------------------------
async function getAllPokemons(req, res) {
  const data = loadData();
  if (!data || !data.pokemons) {
    return res.status(500).json({ error: "Pokémon data not loaded" });
  }

  const id = req.params.id; // optional route parameter

  // If id is provided, return only that Pokémon
  if (id) {
    const pokemon = data.pokemons.find(
      (p) => p.id === parseInt(id, 10) || p.name === id.toLowerCase()
    );
    if (!pokemon) {
      return res.status(404).json({ error: `Pokémon with id ${id} not found` });
    }
    return res.json(pokemon);
  }

  // Fetch next batch asynchronously if not all Pokémon fetched
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

  // Return all Pokémon
  res.json(data);
}

//-------------------------
// Get all moves
//-------------------------
async function getAllMoves(req, res) {
  const data = loadMoves();
  const moveArray = Object.values(data);

  if (!moveArray || !moveArray) {
    return res.status(500).json({ error: "Pokémon moves data not loaded" });
  }

  // Check if a specific ID or name was provided
  const id = req.params.id;
  if (id) {
    const move = moveArray.find(
      (p) =>
        p.id === parseInt(id, 10) || p.name.toLowerCase() === id.toLowerCase()
    );

    if (!move) {
      return res
        .status(404)
        .json({ error: `Move with id or name '${id}' not found` });
    }

    return res.json(move);
  }

  // Return all moves if no ID/name provided
  res.json(data);
}

// ------------------------
// Get Pokémon by region
// ------------------------
function getRegionPokemons(req, res) {
  const regionName = req.params.regionId;

  if (!regionName) {
    return res.status(400).json({ error: "Region ID is required" });
  }

  const pokemons = getRegionPokemonsService(regionName);

  if (!pokemons.length) {
    return res
      .status(404)
      .json({ error: "Region not found or no Pokémon available" });
  }

  res.json({ region: regionName, pokemons });
}

async function getNpc(req, res) {
  const data = loadNpc();
  if (!data || data.length === 0) {
    return res.status(500).json({ error: "NPC data not loaded" });
  }

  const idOrRegion = req.params.id; // undefined if just /npc

  if (idOrRegion) {
    // Return single NPC by region name or numeric id
    const npc = data.find(
      (n, index) =>
        n.region.toLowerCase() === idOrRegion.toLowerCase() ||
        n.id === parseInt(idOrRegion, 10) ||
        index === parseInt(idOrRegion, 10) // optional: index-based
    );

    if (!npc) {
      return res.status(404).json({ error: `NPC '${idOrRegion}' not found` });
    }

    return res.json(npc);
  }

  // If no id param, return all NPCs
  return res.json(data);
}

const getLeaderBoard = async (req, res) => {
  const data = loadLeaderboard();

  if (!data) {
    return res.status(500).json({ error: "Leaderboard data not loaded" });
  }

  const name = req.params.name;

  if (name) {
    const leaderboard = data.find(
      (response) => response.name.toLowerCase() === name.toLowerCase()
    );
    if (!leaderboard)
      return res.status(404).json({ error: "Leaderboard data not found" });

    return res.json(leaderboard);
  }
  return res.json(data);
};

const addLeaderBoard = (req, res) => {
  try {
    const data = loadLeaderboard() || [];

    const { name, record } = req.body;
    if (!name || !Array.isArray(record)) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const match = data.find(
      (player) => player.name.toLowerCase() === name.toLowerCase()
    );

    if (match) {
      return res.status(409).json({
        error: `Name '${name}' already exists, choose another name.`,
      });
    }

    data.push({ name, record });
    saveLeaderboard(data);

    res.status(201).json({
      message: "Added successfully",
      data: { name, record },
    });
  } catch (err) {
    console.error("addLeaderBoard error:", err);
    res.status(500).json({ error: "Failed to write leaderboard" });
  }
};

const updateLeaderBoard = (req, res) => {
  try {
    const name = req.params.name.toLowerCase();
    const { record } = req.body;

    if (!record || !Array.isArray(record)) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const leaderboard = loadLeaderboard();
    const index = leaderboard.findIndex((p) => p.name.toLowerCase() === name);

    if (index === -1) {
      return res.status(404).json({ error: "Player not found" });
    }

    leaderboard[index].record = record;
    saveLeaderboard(leaderboard);

    res.json({ message: "Updated successfully", data: leaderboard[index] });
  } catch (err) {
    res.status(500).json({ error: "Failed to update leaderboard" });
  }
};

const narrateBattle = async (req, res) => {
  const { attacker, move, defender, outcome, hpRemaining } = req.body;

  const prompt = `
You are a Pokémon battle commentator. Write one very short, exciting sentence about this battle event:
{
  "attacker": "${attacker}",
  "move": "${move}",
  "defender": "${defender}",
  "outcome": "${outcome}",
  "hpRemaining": ${hpRemaining}
}`;

  try {
    const response = await ai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    console.log("Gemini response:", response.choices[0].message.content);
    res.json({ message: response.choices[0].message.content });
  } catch (err) {
    console.error("Gemini API error:", err);
    res.status(500).json({ error: "Failed to generate commentary via Gemini" });
  }
};

export {
  getAllPokemons,
  getRegionPokemons,
  getAllMoves,
  getNpc,
  getLeaderBoard,
  addLeaderBoard,
  updateLeaderBoard,
  narrateBattle,
};

import {
  loadData,
  loadMoves,
  loadNpc,
  loadLeaderboard,
  fetchNextBatch,
} from "../services/pokemonServices.js";

import { getRegionPokemonsService } from "../services/regionService.js";

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
  // addLeaderBoard,
  // updateLeaderBoard,
  narrateBattle,
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "pokemon.json");
const MOVES_FILE = path.join(__dirname, "..", "moves.json");

// ------------------------
// Helpers
// ------------------------
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  }
  return null;
}

function loadMoves() {
  if (fs.existsSync(MOVES_FILE)) {
    return JSON.parse(fs.readFileSync(MOVES_FILE, "utf-8"));
  }
  return {};
}

// Pick N random items from an array
function pickRandom(arr, count) {
  return arr.sort(() => 0.5 - Math.random()).slice(0, count);
}

// ------------------------
// Main Function
// ------------------------
async function fetchAndStoreData() {
  try {
    const movesData = loadMoves();
    const [pokemonResponse] = await Promise.all([
      axios.get("https://pokeapi.co/api/v2/pokemon?limit=151"),
    ]);

    const pokemonDetails = await Promise.all(
      pokemonResponse.data.results.map(async (p, index) => {
        const details = await axios.get(p.url);
        const d = details.data;

        // Pokémon types
        const pokemonTypes = d.types.map((t) => t.type.name);

        // Get valid move objects for this Pokémon
        const validMoves = d.moves
          .map((m) => {
            const id = parseInt(
              m.move.url.split("/").filter(Boolean).pop(),
              10
            );
            return movesData[id];
          })
          .filter(Boolean);

        // Split moves by type
        const movesByType = {};
        validMoves.forEach((mv) => {
          if (!movesByType[mv.type]) movesByType[mv.type] = [];
          movesByType[mv.type].push(mv);
        });

        let chosenMoves = [];

        // 1. Pick guaranteed weak (<50) and strong (>75) move of Pokémon type
        for (let type of pokemonTypes) {
          const weakMoves = (movesByType[type] || []).filter(
            (m) => m.power < 50
          );
          const strongMoves = (movesByType[type] || []).filter(
            (m) => m.power > 75
          );

          if (weakMoves.length > 0)
            chosenMoves.push(pickRandom(weakMoves, 1)[0]);
          if (strongMoves.length > 0)
            chosenMoves.push(pickRandom(strongMoves, 1)[0]);

          if (chosenMoves.length >= 2) break; // stop once we have type-specific moves
        }

        // 2. Fill remaining moves from any valid moves
        const remainingMoves = validMoves.filter(
          (m) => !chosenMoves.includes(m)
        );
        const movesNeeded = 4 - chosenMoves.length;
        if (remainingMoves.length > 0 && movesNeeded > 0) {
          chosenMoves.push(
            ...pickRandom(
              remainingMoves,
              Math.min(movesNeeded, remainingMoves.length)
            )
          );
        }

        return {
          id: index + 1,
          name: d.name,
          image: d.sprites.front_default,
          sprite_front: d.sprites.other.showdown.front_default,
          sprite_back: d.sprites.other.showdown.back_default,
          stats: d.stats.map((s) => ({ name: s.stat.name, base: s.base_stat })),
          types: pokemonTypes,
          moves: chosenMoves,
        };
      })
    );

    const data = { pokemons: pokemonDetails };
    saveData(data);
    return data;
  } catch (err) {
    console.error("Error fetching Pokémon data:", err.message);
    return null;
  }
}

module.exports = { saveData, loadData, fetchAndStoreData };

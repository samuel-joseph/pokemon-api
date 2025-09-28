const axios = require("axios");
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "pokemon.json");
const MOVES_FILE = path.join(__dirname, "..", "moves.json");

const BATCH_SIZE = 50;

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
  return { pokemons: [] };
}

function loadMoves() {
  if (fs.existsSync(MOVES_FILE)) {
    return JSON.parse(fs.readFileSync(MOVES_FILE, "utf-8"));
  }
  return {};
}

function pickRandom(arr, count) {
  return arr.sort(() => 0.5 - Math.random()).slice(0, count);
}

function calculateHP(base, level, iv = 0, ev = 0) {
  return (
    Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) +
    level +
    10
  );
}

// ------------------------
// Incremental Fetch
// ------------------------
async function fetchNextBatch() {
  try {
    const data = loadData();
    const startIndex = data.pokemons.length;
    const movesData = loadMoves();

    // Fetch Pokémon list
    const listResponse = await axios.get(
      "https://pokeapi.co/api/v2/pokemon?limit=905"
    );
    const allPokemon = listResponse.data.results;

    if (startIndex >= allPokemon.length) {
      console.log("All Pokémon already fetched!");
      return data;
    }

    const batch = allPokemon.slice(startIndex, startIndex + BATCH_SIZE);

    const pokemonDetails = await Promise.all(
      batch.map(async (p, index) => {
        const d = (await axios.get(p.url)).data;

        const pokemonTypes = d.types.map((t) => t.type.name);
        const validMoves = d.moves
          .map((m) => {
            const id = parseInt(
              m.move.url.split("/").filter(Boolean).pop(),
              10
            );
            return movesData[id];
          })
          .filter(Boolean);

        // Pick up to 4 moves
        const chosenMoves = pickRandom(
          validMoves,
          Math.min(4, validMoves.length)
        );

        const hpStat =
          d.stats.find((s) => s.stat.name === "hp")?.base_stat ?? 0;
        const maxHP = calculateHP(hpStat, 50);

        return {
          id: startIndex + index + 1,
          name: d.name,
          level: 50,
          maxHP,
          image: d.sprites.front_default,
          sprite_front: d.sprites.other.showdown.front_default,
          sprite_back: d.sprites.other.showdown.back_default,
          stats: d.stats.map((s) => ({ name: s.stat.name, base: s.base_stat })),
          types: pokemonTypes,
          moves: chosenMoves,
          ivs: {
            hp: 0,
            attack: 0,
            defense: 0,
            spAttack: 0,
            spDefense: 0,
            speed: 0,
          },
          evs: {
            hp: 0,
            attack: 0,
            defense: 0,
            spAttack: 0,
            spDefense: 0,
            speed: 0,
          },
        };
      })
    );

    data.pokemons.push(...pokemonDetails);
    saveData(data);
    console.log(`Fetched Pokémon ${startIndex + 1} to ${data.pokemons.length}`);

    return data;
  } catch (err) {
    console.error("Error fetching Pokémon batch:", err.message);
    return loadData();
  }
}

// ------------------------
// Exports
// ------------------------
module.exports = {
  saveData,
  loadData,
  fetchNextBatch,
  calculateHP,
};

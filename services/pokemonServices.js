import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { megaEvolveCapable } from "../helper/megaEvolutionLists.js";

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "..", "data/pokemon.json");
const MOVES_FILE = path.join(__dirname, "..", "data/moves.json");
const NPC_FILE = path.join(__dirname, "..", "data/npc.json");
const LEADERBOARD_FILE = path.join(__dirname, "..", "data/leaderboard.json");
const MEGA_FILE = path.join(__dirname, "..", "data/mega.json");
const EVOLUTION_FILE = path.join(__dirname, "..", "data/evolutionChart.json");

const BATCH_SIZE = 150;
const POKEMON_LEVEL = 75;

// ------------------------
// Helpers
// ------------------------

export const loadLeaderboard = () => {
  const data = fs.readFileSync(LEADERBOARD_FILE, "utf8");
  return JSON.parse(data);
};

export const loadEvolutionboard = () => {
  const data = fs.readFileSync(EVOLUTION_FILE, "utf8");
  return JSON.parse(data);
};

export const saveLeaderboard = (data) => {
  fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(data, null, 2));
};

export function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export function loadNpc() {
  if (fs.existsSync(NPC_FILE)) {
    return JSON.parse(fs.readFileSync(NPC_FILE, "utf-8"));
  }
  return [];
}

export function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  }
  return { pokemons: [] };
}

export const loadMegaData = () => {
  if (fs.existsSync(MEGA_FILE)) {
    return JSON.parse(fs.readFileSync(MEGA_FILE, "utf-8"));
  }
  return [];
};

export function loadMoves() {
  if (fs.existsSync(MOVES_FILE)) {
    return JSON.parse(fs.readFileSync(MOVES_FILE, "utf-8"));
  }
  return {};
}

export function pickRandom(arr, count) {
  return arr.sort(() => 0.5 - Math.random()).slice(0, count);
}

export function calculateHP(base, level, iv = 0, ev = 0) {
  return (
    Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) +
    level +
    10
  );
}

// ------------------------
// Incremental Fetch
// ------------------------
export async function fetchNextBatch() {
  try {
    const data = loadData();
    const startIndex = data.pokemons.length;
    const movesData = loadMoves();

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

        const stabMoves = pokemonTypes
          .map((type) =>
            validMoves.find(
              (mv) =>
                mv.power &&
                mv.power > 50 &&
                mv.type.toLowerCase() === type.toLowerCase()
            )
          )
          .filter(Boolean);

        let chosenMoves = [];
        if (stabMoves.length > 0) {
          const stabMove = pickRandom(stabMoves, 1);
          chosenMoves.push(...stabMove);

          const remaining = pickRandom(
            validMoves.filter((mv) => mv !== stabMove[0]),
            Math.min(3, validMoves.length - 1)
          );
          chosenMoves.push(...remaining);
        } else {
          chosenMoves = pickRandom(validMoves, Math.min(4, validMoves.length));
        }

        const hpStat =
          d.stats.find((s) => s.stat.name === "hp")?.base_stat ?? 0;
        const maxHP = calculateHP(hpStat, POKEMON_LEVEL);

        let stats = d.stats.map((s) => ({
          name: s.stat.name,
          base: s.base_stat,
          stage: 0,
        }));

        const canMega = (pokemonName) => {
          const name = pokemonName.toLowerCase();

          return megaEvolveCapable.some(
            (m) =>
              m.toLowerCase().startsWith(`${name}-mega`) ||
              m.toLowerCase() === `${name}-ash`
          );
        };

        stats.push(
          { name: "accuracy", base: 100, stage: 0 },
          { name: "evasion", base: 100, stage: 0 }
        );

        return {
          id: startIndex + index + 1,
          name: d.name,
          level: POKEMON_LEVEL,
          maxHP,
          currentHP: maxHP,
          image: d.sprites.front_default,
          sprite_front: d.sprites.other.showdown.front_default,
          sprite_back: d.sprites.other.showdown.back_default,
          stats,
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
          charging: false,
          recharging: false,
          canMega: canMega(d.name),
          status: null,
          statusCounter: 0,
          cries: d.cries,
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

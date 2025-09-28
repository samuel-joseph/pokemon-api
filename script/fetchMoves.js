const axios = require("axios");
const fs = require("fs");
const path = require("path");

const MOVES_FILE = path.join(__dirname, "../moves.json");

async function fetchAllMoves() {
  try {
    const moveListRes = await axios.get(
      "https://pokeapi.co/api/v2/move?limit=900"
    ); // adjust limit if needed
    const moves = moveListRes.data.results;

    const allMoves = {};

    await Promise.all(
      moves.map(async (m) => {
        try {
          const moveRes = await axios.get(m.url);
          const mv = moveRes.data;

          // Only include moves with power and not status moves
          if (mv.power && mv.damage_class.name !== "status") {
            // Get move ID from URL: https://pokeapi.co/api/v2/move/33/
            const id = parseInt(m.url.split("/").filter(Boolean).pop(), 10);

            allMoves[id] = {
              name: mv.name,
              type: mv.type.name,
              priority: mv.priority,
              damage_class: mv.damage_class.name,
              power: mv.power,
              crit_rate: mv.meta.crit_rate,
              accuracy: mv.accuracy,
              pp: mv.pp,
              flint_chance: mv.meta.flinch_chance,
            };
          }
        } catch (err) {
          console.warn(`Failed to fetch move ${m.name}: ${err.message}`);
        }
      })
    );

    fs.writeFileSync(MOVES_FILE, JSON.stringify(allMoves, null, 2));
    console.log(`✅ Saved ${Object.keys(allMoves).length} moves to moves.json`);
  } catch (err) {
    console.error("Error fetching moves:", err.message);
  }
}

fetchAllMoves();

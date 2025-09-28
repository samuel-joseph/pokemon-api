const {
  loadData,
  loadMoves,
  fetchNextBatch,
} = require("../services/pokemonServices");
const {
  getRegionPokemons: getRegionPokemonsService,
} = require("../services/regionService");

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

module.exports = {
  getAllPokemons,
  getRegionPokemons,
  getAllMoves,
};

const pokemonService = require("../services/pokemonServices");

async function getPokemons(req, res) {
  const id = req.query.id ? parseInt(req.query.id) : null;

  let data = pokemonService.loadData();

  if (!data || !data.pokemons || data.pokemons.length === 0) {
    await pokemonService.fetchAndStoreData();
    data = pokemonService.loadData();
  }

  if (!data) return res.status(404).json({ error: "Data not found" });

  if (id) {
    const pokemon = data.pokemons.find((p) => p.id === id);
    if (pokemon) {
      return res.json([pokemon]);
    } else {
      return res.status(404).json({ error: "Pokémon not found" });
    }
  }
  res.json(data.pokemons);
}

module.exports = {
  getPokemons,
};

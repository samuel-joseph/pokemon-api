import Pokemon from "../models/pokemon.js";

export const getTrainerPokemon = async (req, res) => {
  try {
    const { name } = req.params;

    if (name) {
      const pokemon = await Pokemon.findOne({ name: name.toLowerCase() });
      if (!pokemon) return res.status(404).json({ error: "Pokemon not found" });
      return res.json(pokemon);
    }

    const allPokemon = await Pokemon.find();
    res.json(allPokemon);
  } catch (err) {
    console.error("Error fetching pokemon:", err);
    res.status(500).json({ error: "Failed to fetch pokemon" });
  }
};

export const addTrainerPokemon = async (req, res) => {
  try {
    const { name } = req.params;
    const newPokemon = req.body;

    const updatedPokemon = await Pokemon.findOneAndUpdate(
      { name: name.toLowerCase() },
      { $push: { pokemon: newPokemon } }, // push new object into array
      { new: true }
    );

    if (!updatedPokemon)
      return res
        .status(404)
        .json({ error: `Pokemon with name '${name}' not found` });

    res.json({
      message: "New pokemon added successfully!",
      pokemon: updatedPokemon,
    });
  } catch (err) {
    console.error("Error adding new pokemon:", err);
    res.status(500).json({ error: "Failed to add pokemon" });
  }
};

export const levelUpTrainerPokemon = async (req, res) => {
  try {
    const { name, pokemonName } = req.params;

    const updatedTrainer = await Record.findOneAndUpdate(
      { name: name.toLowerCase(), "pokemon.name": pokemonName },
      { $inc: { "pokemon.$.level": 1 } },
      { new: true }
    );

    if (!updatedTrainer)
      return res.status(404).json({
        error: `Trainer '${name}' or Pokémon '${pokemonName}' not found`,
      });

    res.json({
      message: `${pokemonName} leveled up successfully!`,
      trainer: updatedTrainer,
    });
  } catch (err) {
    console.error("Error leveling up pokemon:", err);
    res.status(500).json({ error: "Failed to level up pokemon" });
  }
};


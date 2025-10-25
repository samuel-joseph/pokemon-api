import Pokemon from "../models/pokemon.js";
import { loadEvolutionboard } from "../services/pokemonServices.js";

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
    const { levelUpCount = 1 } = req.body; // default to +1 level if not provided

    // Step 1: Find trainer and specific Pokémon
    const trainer = await Record.findOne({ name: name.toLowerCase() });
    if (!trainer) {
      return res.status(404).json({ error: `Trainer '${name}' not found` });
    }

    const pokemonIndex = trainer.pokemon.findIndex(
      (p) => p.name.toLowerCase() === pokemonName.toLowerCase()
    );
    if (pokemonIndex === -1) {
      return res
        .status(404)
        .json({ error: `Pokémon '${pokemonName}' not found in trainer team` });
    }

    // Step 2: Level up Pokémon
    trainer.pokemon[pokemonIndex].level += levelUpCount;

    // Step 3: Check evolution eligibility
    const currentPokemon = trainer.pokemon[pokemonIndex];

    const data = loadEvolutionboard();
    const evolutionEntry = data[currentPokemon];

    if (evolutionEntry) {
      const currentStage = evolutionEntry.find(
        (stage) => stage.name === currentPokemon.name.toLowerCase()
      );

      if (
        currentStage &&
        currentStage.evolvesTo.length > 0 &&
        currentStage.level &&
        currentPokemon.level >= currentStage.level
      ) {
        // Step 4: Evolve Pokémon
        const evolvedName = currentStage.evolvesTo[0]; // first evolution target
        currentPokemon.name = evolvedName;
        currentPokemon.level = currentStage.level; // optional reset
        // optionally update ID if your pokemon.json or DB has it
        const evolvedData = await Pokemon.findOne({
          name: evolvedName.toLowerCase(),
        });
        if (evolvedData) {
          currentPokemon.id = evolvedData.id;
        }
      }
    }

    await trainer.save();

    res.json({
      message: `${pokemonName} leveled up by ${levelUpCount}${
        currentPokemon.name !== pokemonName
          ? ` and evolved into ${currentPokemon.name}! 🎉`
          : "!"
      }`,
      trainer,
    });
  } catch (err) {
    console.error("Error leveling up pokemon:", err);
    res.status(500).json({ error: "Failed to level up pokemon" });
  }
};

export const addExperienceToPokemon = async (req, res) => {
  try {
    const { name, pokemonName } = req.params;
    const { expGain } = req.body; // frontend sends how much EXP to add

    const trainer = await Pokemon.findOne({ name: name.toLowerCase() });
    if (!trainer)
      return res.status(404).json({ error: `Trainer '${name}' not found` });

    const pokemon = trainer.pokemon.find((p) => p.name === pokemonName);
    if (!pokemon)
      return res
        .status(404)
        .json({ error: `Pokémon '${pokemonName}' not found` });

    // Level up logic
    const updatedPokemon = gainExperience(pokemon, expGain);

    await trainer.save();

    res.json({
      message: `${pokemonName} gained ${expGain} EXP!`,
      pokemon: updatedPokemon,
    });
  } catch (err) {
    console.error("Error leveling up pokemon:", err);
    res.status(500).json({ error: "Failed to add experience" });
  }
};

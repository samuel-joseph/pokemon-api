import fs from "fs";
import fetch from "node-fetch";

const evolutionChart = {};

const getEvolutionChainId = async (pokemonName) => {
  const speciesResponse = await fetch(
    `https://pokeapi.co/api/v2/pokemon-species/${pokemonName}/`
  );
  const speciesData = await speciesResponse.json();
  return speciesData.evolution_chain.url.split("/").slice(-2, -1)[0];
};

const getEvolutionData = async (chainId) => {
  const chainResponse = await fetch(
    `https://pokeapi.co/api/v2/evolution-chain/${chainId}/`
  );
  const chainData = await chainResponse.json();
  return chainData.chain;
};

const parseEvolution = (chain) => {
  const evolutions = [];
  let current = chain;

  while (current) {
    const evolution = {
      name: current.species.name,
      evolvesTo: current.evolves_to.map((evo) => evo.species.name),
      level:
        current.evolution_details.length > 0
          ? current.evolution_details[0].min_level
          : null,
      item:
        current.evolution_details.length > 0
          ? current.evolution_details[0].item?.name
          : null,
    };
    evolutions.push(evolution);
    current = current.evolves_to[0];
  }

  return evolutions;
};

export const generateEvolutionChart = async () => {
  const pokemonNames = [
    "bulbasaur",
    "ivysaur",
    "venusaur",
    "charmander",
    "charmeleon",
    "charizard",
    "pikachu",
  ]; // Add more Pokémon names as needed

  for (let name = 1; name < 900; name++) {
    try {
      const chainId = await getEvolutionChainId(name);
      const chainData = await getEvolutionData(chainId);
      const evolutions = parseEvolution(chainData);
      evolutionChart[name] = evolutions;
    } catch (error) {
      console.error(`Failed to fetch evolution data for ${name}:`, error);
    }
  }

  fs.writeFileSync(
    "./data/evolutionChart.json",
    JSON.stringify(evolutionChart, null, 2)
  );
  console.log("evolutionChart.json has been generated!");
};

generateEvolutionChart();

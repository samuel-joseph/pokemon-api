import fs from "fs";
import path from "path";
import { loadData } from "../services/pokemonServices.js";

// Define gym leaders with Pokémon IDs or names
const gymLeadersTemplate = [
  {
    region: "kanto",
    gymLeaders: [
      {
        name: "Blue",
        pokemon: [
          "pidgeot",
          "alakazam",
          "rhydon",
          "gyarados",
          "arcanine",
          "venusaur",
        ],
      },
    ],
  },
  {
    region: "johto",
    gymLeaders: [
      {
        name: "Lance",
        pokemon: [
          "gyarados",
          "dragonite",
          "dragonite",
          "dragonite",
          "aerodactyl",
          "charizard",
        ],
      },
    ],
  },
  // ... other regions ...
];

export async function buildNpcData() {
  const npcData = [];
  const data = loadData();

  for (const region of gymLeadersTemplate) {
    const regionData = { region: region.region, gymLeaders: [] };

    for (const leader of region.gymLeaders) {
      const leaderData = { name: leader.name, pokemon: [] };

      for (const id of leader.pokemon) {
        const pokeData = data.pokemons.find(
          (p) => p.id === parseInt(id, 10) || p.name === id
        );
        if (pokeData) leaderData.pokemon.push(pokeData);
      }

      regionData.gymLeaders.push(leaderData);
    }

    npcData.push(regionData);
  }

  const filePath = path.join(path.resolve(), "data/npc.json");
  fs.writeFileSync(filePath, JSON.stringify(npcData, null, 2));
  console.log(`✅ npc.json written to ${filePath}`);
}

// ❌ DO NOT auto-run buildNpcData here if you want to import it elsewhere

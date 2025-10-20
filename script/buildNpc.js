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
          "nidoking",
          "arcanine",
          "rhydon",
          "blastoise",
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
          "charizard",
          "dragonite",
          "dragonite",
          "dragonite",
          "aerodactyl",
          "gyarados",
        ],
      },
    ],
  },
  {
    region: "hoenn",
    gymLeaders: [
      {
        name: "Steven",
        pokemon: [
          "skarmory",
          "claydol",
          "aggron",
          "cradily",
          "armaldo",
          "metagross",
        ],
      },
    ],
  },
  {
    region: "sinnoh",
    gymLeaders: [
      {
        name: "Cynthia",
        pokemon: [
          "spiritomb",
          "gastrodon",
          "lucario",
          "milotic",
          "roserade",
          "garchomp",
        ],
      },
    ],
  },
  {
    region: "unova",
    gymLeaders: [
      {
        name: "Iris",
        pokemon: [
          "hydreigon",
          "druddigon",
          "lapras",
          "aggron",
          "archeops",
          "haxorus",
        ],
      },
    ],
  },
  {
    region: "kalos",
    gymLeaders: [
      {
        name: "Diantha",
        pokemon: [
          "hawlucha",
          "tyrantrum",
          "aurorus",
          "gourgeist",
          "goodra",
          "gardevoir",
        ],
      },
    ],
  },
  {
    region: "alola",
    gymLeaders: [
      {
        name: "Kukui",
        pokemon: [
          "lycanroc",
          "braviary",
          "magnezone",
          "snorlax",
          "ninetales",
          "decidueye",
        ],
      },
    ],
  },
  {
    region: "galar",
    gymLeaders: [
      {
        name: "Leon",
        pokemon: [
          "aegislash",
          "dragapult",
          "haxorus",
          "rhyperior",
          "seismitoad",
          "charizard",
        ],
      },
    ],
  },
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

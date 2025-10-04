const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { loadData } = require("../services/pokemonServices");

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
  {
    region: "hoenn",
    gymLeaders: [
      {
        name: "Steven",
        pokemon: [
          "skarmory",
          "claydol",
          "cradily",
          "armaldo",
          "aggron",
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
          "roserade",
          "togekiss",
          "lucario",
          "milotic",
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
          "ninetales",
          "braviary",
          "magnezone",
          "snorlax",
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
          "seismitoad",
          "mr-rime",
          "charizard",
        ],
      },
    ],
  },
];
async function buildNpcData() {
  const npcData = [];
  const data = loadData();

  for (const region of gymLeadersTemplate) {
    const regionData = { region: region.region, gymLeaders: [] };

    for (const leader of region.gymLeaders) {
      const leaderData = { name: leader.name, pokemon: [] };

      for (const id of leader.pokemon) {
        const pokeData = data.pokemons.find(
          (p) => p.id === parseInt(id, 10) || p.name == id
        );
        if (pokeData) leaderData.pokemon.push(pokeData);
      }

      regionData.gymLeaders.push(leaderData);
    }

    npcData.push(regionData);
  }

  const filePath = path.join(__dirname, "../data/npc.json");
  fs.writeFileSync(filePath, JSON.stringify(npcData, null, 2));
  console.log(`npc.json written to ${filePath}`);
}

// Run the script
buildNpcData();

module.exports = { buildNpcData };

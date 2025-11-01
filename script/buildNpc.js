import fs from "fs";
import path from "path";
import { loadData } from "../services/pokemonServices.js";

// Define gym leaders with Pokémon IDs or names
const gymLeadersTemplate = [
  // {
  //   region: "kanto",
  //   gymLeaders: [
  //     {
  //       name: "Blue",
  //       pokemon: [
  //         { name: "pidgeot", level: 75 },
  //         { name: "exeggutor", level: 77 },
  //         { name: "alakazam", level: 76 },
  //         { name: "nidoking", level: 78 },
  //         { name: "arcanine", level: 78 },
  //         { name: "rhydon", level: 78 },
  //         { name: "blastoise", level: 80, canMega: true },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   region: "johto",
  //   gymLeaders: [
  //     {
  //       name: "Lance",
  //       pokemon: [
  //         { name: "charizard", level: 80 },
  //         { name: "dragonite", level: 80 },
  //         { name: "dragonite", level: 78 },
  //         { name: "dragonite", level: 80 },
  //         { name: "aerodactyl", level: 79 },
  //         { name: "gyarados", level: 82, canMega: true },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   region: "hoenn",
  //   gymLeaders: [
  //     {
  //       name: "Steven",
  //       pokemon: [
  //         { name: "skarmory", level: 81 },
  //         { name: "claydol", level: 82 },
  //         { name: "aggron", level: 81 },
  //         { name: "cradily", level: 83 },
  //         { name: "armaldo", level: 83 },
  //         { name: "metagross", level: 84, canMega: true },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   region: "sinnoh",
  //   gymLeaders: [
  //     {
  //       name: "Cynthia",
  //       pokemon: [
  //         { name: "spiritomb", level: 85 },
  //         { name: "gastrodon", level: 85 },
  //         { name: "lucario", level: 86 },
  //         { name: "milotic", level: 86 },
  //         { name: "roserade", level: 84 },
  //         { name: "garchomp", level: 87, canMega: true },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   region: "unova",
  //   gymLeaders: [
  //     {
  //       name: "Iris",
  //       pokemon: [
  //         { name: "hydreigon", level: 86 },
  //         { name: "druddigon", level: 86 },
  //         { name: "lapras", level: 86 },
  //         { name: "aggron", level: 87 },
  //         { name: "archeops", level: 87 },
  //         { name: "haxorus", level: 88 },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   region: "kalos",
  //   gymLeaders: [
  //     {
  //       name: "Diantha",
  //       pokemon: [
  //         { name: "hawlucha", level: 87 },
  //         { name: "tyrantrum", level: 87 },
  //         { name: "aurorus", level: 87 },
  //         { name: "gourgeist", level: 86 },
  //         { name: "goodra", level: 86 },
  //         { name: "gardevoir", level: 88, canMega: true },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   region: "alola",
  //   gymLeaders: [
  //     {
  //       name: "Kukui",
  //       pokemon: [
  //         { name: "lycanroc", level: 87 },
  //         { name: "braviary", level: 87 },
  //         { name: "magnezone", level: 87 },
  //         { name: "snorlax", level: 86 },
  //         { name: "ninetales", level: 86 },
  //         { name: "decidueye", level: 88 },
  //       ],
  //     },
  //   ],
  // },
  // {
  {
    region: "kanto",
    gymLeaders: [
      {
        name: "Leon",
        pokemon: [
          // { name: "aegislash", level: 89 },
          // { name: "dragapult", level: 92 },
          // { name: "haxorus", level: 90 },
          // { name: "rhyperior", level: 91 },
          // { name: "seismitoad", level: 88 },
          { name: "charizard", level: 95, canMega: true },
          { name: "charizard", level: 95, canMega: true },
          { name: "charizard", level: 95, canMega: true },
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

      for (const poke of leader.pokemon) {
        // If poke is a string, default level to 75, else use provided level
        // Default canMega to false unless specified
        const pokeObj =
          typeof poke === "string"
            ? { name: poke, level: 75, canMega: false }
            : {
                ...poke,
                level: poke.level ?? 75,
                canMega: poke.canMega ?? false,
              };

        const pokeData = data.pokemons.find(
          (p) => p.id === parseInt(pokeObj.name, 10) || p.name === pokeObj.name
        );

        if (pokeData) {
          // Attach dynamic level and canMega property
          leaderData.pokemon.push({
            ...pokeData,
            level: pokeObj.level,
            canMega: pokeObj.canMega,
          });
        }
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

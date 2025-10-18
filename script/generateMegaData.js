import { megaEvolveCapable } from "../helper/megaEvolutionLists.js";
import { calculateHP } from "../services/pokemonServices.js";
import fs from "fs";

async function getPokemonData(name) {
  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`
  );
  if (!res.ok) {
    console.warn(`⚠️ Failed to fetch ${name}`);
    return null;
  }

  const data = await res.json();

  const hpStat = data.stats.find((s) => s.stat.name === "hp")?.base_stat ?? 0;
  const maxHP = calculateHP(hpStat, 80);

  let stats = data.stats.map((s) => ({
    name: s.stat.name,
    base: s.base_stat,
    stage: 0,
  }));

  stats.push(
    { name: "accuracy", base: 100, stage: 0 },
    { name: "evasion", base: 100, stage: 0 }
  );
  return {
    name: data.name,
    sprite_front: data.sprites.other.showdown.front_default,
    sprite_back: data.sprites.other.showdown.back_default,
    maxHP,
    currentHP: maxHP,
    types: data.types.map((t) => t.type.name),
    stats,
  };
}

export const generateMegaData = async () => {
  const megaData = [];
  for (const name of megaEvolveCapable) {
    const data = await getPokemonData(name);
    if (data) megaData.push(data);
  }

  fs.writeFileSync("./data/mega.json", JSON.stringify(megaData, null, 2));
  console.log("✅ mega.json generated successfully!");
};

generateMegaData();

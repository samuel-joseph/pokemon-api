import { loadData } from "./pokemonServices.js";
export const regionMap = {
  kanto: { start: 1, end: 151 },
  johto: { start: 152, end: 251 },
  hoenn: { start: 252, end: 386 },
  sinnoh: { start: 387, end: 493 },
  unova: { start: 494, end: 649 },
  kalos: { start: 650, end: 721 },
  alola: { start: 722, end: 809 },
  galar: { start: 810, end: 905 },
};

const LEGENDARY_IDS = [
  144, 145, 146, 150, 151, 243, 244, 245, 249, 250, 251, 377, 378, 379, 380,
  381, 382, 383, 385, 386, 384, 483, 484, 487, 643, 644, 716, 717, 791, 792,
  888, 889, 1007, 1008,
];

export function getRegionPokemonsService(regionName) {
  const data = loadData(); // load pokemon.json
  if (!data) return [];

  const region = regionMap[regionName.toLowerCase()];
  if (!region) return [];

  // Filter Pokémon by ID
  return data.pokemons.filter(
    (p) =>
      p.id >= region.start &&
      p.id <= region.end &&
      !LEGENDARY_IDS.includes(p.id)
  );
}

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

export function getRegionPokemonsService(regionName) {
  const data = loadData(); // load pokemon.json
  if (!data) return [];

  const region = regionMap[regionName.toLowerCase()];
  if (!region) return [];

  // Filter Pokémon by ID
  return data.pokemons.filter(
    (p) => p.id >= region.start && p.id <= region.end
  );
}

import { loadMegaData } from "../services/pokemonServices.js";

export const getMega = async (req, res) => {
  const data = loadMegaData();
  const megaArray = Object.values(data);

  if (!megaArray || megaArray.length === 0) {
    return res.status(500).json({ error: "Pokémon mega data not loaded" });
  }

  const name = req.params.name?.toLowerCase();
  if (name) {
    const matches = megaArray.filter((p) => {
      const megaName = p.name.toLowerCase();

      // Match base name for Mega evolutions or special forms
      return (
        megaName.startsWith(`${name}-mega`) ||
        megaName === `${name}-ash` || // Greninja-Ash
        megaName === name // direct name match if exists
      );
    });

    if (matches.length === 0) {
      return res
        .status(404)
        .json({ error: `No Mega or alternate form found for '${name}'` });
    }

    return res.json(matches.length === 1 ? matches[0] : matches);
  }

  // If no param provided, return all megas
  res.json(megaArray);
};

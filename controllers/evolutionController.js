import { loadEvolutionboard } from "../services/pokemonServices.js";

export const getEvolutionById = (req, res) => {
  try {
    const { id } = req.params; // comes from /:name/evolution/:id

    const data = loadEvolutionboard();
    const chain = data[id];
    if (!chain) {
      return res
        .status(404)
        .json({ error: `Evolution data for ID '${id}' not found` });
    }

    res.json({
      message: `Evolution chain for ID '${id}' retrieved successfully`,
      evolutionChain: chain,
    });
  } catch (err) {
    console.error("Error fetching evolution:", err);
    res.status(500).json({ error: "Failed to fetch evolution data" });
  }
};

export const formatPokemonName = (name) => {
  if (!name) return "";

  // Split by "-"
  const parts = name.split("-");

  // Check if it's a Mega evolution
  if (parts.includes("mega")) {
    // Remove "mega" from its position
    const filtered = parts.filter((p) => p !== "mega");
    // Capitalize remaining parts
    const formatted = filtered
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
    return `Mega ${formatted}`;
  }

  // Normal Pokémon: capitalize each part
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
};

import mongoose from "mongoose";

const moveSchema = new mongoose.Schema({
  id: Number,
  name: String,
  type: String,
  priority: Number,
  damage_class: String,
  power: Number,
  accuracy: Number,
  pp: Number,
  crit_rate: Number,
  flint_chance: Number,
  ailment_name: String,
  ailment_chance: Number,
  category_name: String,
  stat_changes: [Object],
  stat_changes_chance: Number,
  healing: Number,
  drain: Number,
  max_hits: Number,
  max_turns: Number,
  min_hits: Number,
  min_turns: Number,
  effect_chance: Number,
  effect_entries: String,
});

const pokemonSchema = new mongoose.Schema({
  id: Number,
  name: String,
  level: Number,
  maxHP: Number,
  currentHP: Number,
  image: String,
  sprite_front: String,
  sprite_back: String,
  stats: [
    {
      name: String,
      base: Number,
      stage: Number,
    },
  ],
  types: [String],
  moves: [moveSchema],
  ivs: {
    hp: Number,
    attack: Number,
    defense: Number,
    spAttack: Number,
    spDefense: Number,
    speed: Number,
  },
  evs: {
    hp: Number,
    attack: Number,
    defense: Number,
    spAttack: Number,
    spDefense: Number,
    speed: Number,
  },
  charging: Boolean,
  recharging: Boolean,
});

const recordSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  record: [
    {
      region: { type: String },
      win: { type: Number, default: 0 },
      pokemon: [pokemonSchema], // ✅ store full Pokémon data here
    },
  ],
});

export default mongoose.model("Record", recordSchema);

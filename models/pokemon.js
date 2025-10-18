import { pokemonModel } from "./recordModel.js";
import mongoose from "mongoose";

const pokemonSchema = new mongoose.Schema({
  trainer: { type: mongoose.Schema.ObjectId, ref: "Trainer", required: true },
  name: { type: String, required: true },
  pokemon: { type: [pokemonModel], default: [] },
});

export default mongoose.model("Pokemon", pokemonSchema);

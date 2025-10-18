import mongoose from "mongoose";

export const megaModel = new mongoose.Schema({
  default: String,
  name: String,
  sprite_front: String,
  sprite_back: String,
  maxHP: Number,
  currentHP: Number,
  types: [String],
  stats: [
    {
      name: String,
      base: Number,
      stage: Number,
    },
  ],
});

export default mongoose.model("Mega", megaModel);

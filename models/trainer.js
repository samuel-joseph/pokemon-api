import mongoose from "mongoose";

const trainerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed password
});

export default mongoose.model("Trainer", trainerSchema);

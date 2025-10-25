import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Trainer from "../models/trainer.js";
import Record from "../models/recordModel.js";
import Pokemon from "../models/pokemon.js";

export const signup = async (req, res) => {
  // pokemonsUsed: array of pokemon objects the player defeated Kanto leader with

  const { username, password } = req.body;
  try {
    // Check if user exists
    const existingUser = await Trainer.findOne({ username });
    if (existingUser)
      return res.status(400).json({ error: "Username already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const trainer = new Trainer({
      username,
      password: hashedPassword,
    });
    await trainer.save();

    // Create initial record for Kanto win
    const record = new Record({
      user: trainer._id,
      name: username,
      record: [
        {
          region: "kanto",
          win: 1,
        },
      ],
    });

    await record.save();

    const pokemon_db = new Pokemon({
      trainer: trainer._id,
      name: username,
    });

    await pokemon_db.save();

    // Issue JWT token
    const token = jwt.sign({ id: trainer._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: `Welcome ${username}! Your first Kanto win is recorded.`,
      token,
      trainer,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Failed to sign up" });
  }
};

export const loginUser = async (req, res) => {
  const { username, password } = req.body;
  const trainer = await Trainer.findOne({ username });
  if (!trainer) return res.status(400).json({ error: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, trainer.password);
  if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { id: trainer._id, username: trainer.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token, message: "Login successful" });
};

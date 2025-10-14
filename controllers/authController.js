import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Record from "../models/Record.js";

export const signup = async (req, res) => {
  const { username, password, pokemonsUsed } = req.body;
  // pokemonsUsed: array of pokemon objects the player defeated Kanto leader with

  try {
    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ error: "Username already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      username,
      password: hashedPassword,
    });
    await user.save();

    // Create initial record for Kanto win
    const record = new Record({
      user: user._id,
      name: username,
      record: [
        {
          region: "kanto",
          win: 1,
          pokemon: pokemonsUsed, // pass in the pokemons used
        },
      ],
    });

    await record.save();

    // Issue JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: `Welcome ${username}! Your first Kanto win is recorded.`,
      token,
      user: {
        id: user._id,
        username: user.username,
      },
      record,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Failed to sign up" });
  }
};

export const loginUser = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "6h" }
  );

  res.json({ token });
};

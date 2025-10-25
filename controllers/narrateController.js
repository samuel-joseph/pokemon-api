import OpenAI from "openai";

const ai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export const narrateBattle = async (req, res) => {
  const { attacker, move, defender, outcome, hpRemaining } = req.body;

  const prompt = `
You are a Pokémon battle commentator. Write one very short, exciting sentence about this battle event:
{
  "attacker": "${attacker}",
  "move": "${move}",
  "defender": "${defender}",
  "outcome": "${outcome}",
  "hpRemaining": ${hpRemaining}
}`;

  try {
    const response = await ai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    console.log("Gemini response:", response.choices[0].message.content);
    res.json({ message: response.choices[0].message.content });
  } catch (err) {
    console.error("Gemini API error:", err);
    res.status(500).json({ error: "Failed to generate commentary via Gemini" });
  }
};

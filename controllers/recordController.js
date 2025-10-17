import Record from "../models/record.js";
import Trainer from "../models/trainer.js";

/**
 * Add a new record for a trainer
 */
export const addRecord = async (req, res) => {
  try {
    const { region, win, pokemon } = req.body;
    const userId = req.userId; // from JWT middleware

    // Verify trainer exists
    const trainer = await Trainer.findById(userId);
    if (!trainer) {
      return res.status(404).json({ error: "Trainer not found" });
    }

    // Check if trainer already has a record for that region
    let record = await Record.findOne({ user: userId });

    if (record) {
      // Update existing record
      const regionRecord = record.record.find((r) => r.region === region);
      if (regionRecord) {
        regionRecord.win += win ?? 1; // increment win
        regionRecord.pokemon = pokemon ?? regionRecord.pokemon;
      } else {
        record.record.push({ region, win: win ?? 1, pokemon });
      }
    } else {
      // Create a new record entry
      record = new Record({
        user: userId,
        name: trainer.username,
        record: [{ region, win: win ?? 1, pokemon }],
      });
    }

    await record.save();
    res.status(201).json({ message: "Record saved successfully!", record });
  } catch (err) {
    console.error("Error saving record:", err);
    res.status(500).json({ error: "Failed to save record" });
  }
};

/**
 * Get all records or a specific trainer's record by name
 */
export const getRecord = async (req, res) => {
  try {
    const { name } = req.params;

    if (name) {
      const record = await Record.findOne({ name: name.toLowerCase() });
      if (!record) return res.status(404).json({ error: "Record not found" });
      return res.json(record);
    }

    const allRecords = await Record.find();
    res.json(allRecords);
  } catch (err) {
    console.error("Error fetching records:", err);
    res.status(500).json({ error: "Failed to fetch records" });
  }
};

/**
 * Update a record by trainer name
 */
export const updateRecord = async (req, res) => {
  try {
    const { name } = req.params;
    const updatedData = req.body;

    const record = await Record.findOneAndUpdate(
      { name: name.toLowerCase() },
      updatedData,
      { new: true }
    );

    if (!record)
      return res
        .status(404)
        .json({ error: `Record with name '${name}' not found` });

    res.json({ message: "Record updated successfully!", record });
  } catch (err) {
    console.error("Error updating record:", err);
    res.status(500).json({ error: "Failed to update record" });
  }
};

/**
 * Delete a record by trainer name
 */
export const deleteRecord = async (req, res) => {
  try {
    const { name } = req.params;

    const record = await Record.findOneAndDelete({
      name: name.toLowerCase(),
    });

    if (!record)
      return res
        .status(404)
        .json({ error: `Record with name '${name}' not found` });

    res.json({
      message: "Record deleted successfully!",
      deletedRecord: record,
    });
  } catch (err) {
    console.error("Error deleting record:", err);
    res.status(500).json({ error: "Failed to delete record" });
  }
};

export const incrementRegionWin = async (req, res) => {
  try {
    const { name, region } = req.params;
    const { pokemon } = req.body;

    // Increment "win" and optionally replace "pokemon" for that region
    const record = await Record.findOneAndUpdate(
      { name, "record.region": region },
      {
        $inc: { "record.$.win": 1 },
        ...(pokemon ? { "record.$.pokemon": pokemon } : {}), // optional
      },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({
        error: `Record for '${name}' with region '${region}' not found.`,
      });
    }

    res.json({
      message: `Win count for ${region} incremented successfully!`,
      data: record,
    });
  } catch (err) {
    console.error("Error incrementing win count:", err);
    res.status(500).json({ error: "Failed to increment win count" });
  }
};

import Record from "../models/record.js";

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
export const addRecordItem = async (req, res) => {
  try {
    const { name } = req.params;
    const newRecord = req.body; // e.g. { pokemon: "Bulbasaur", win: 0, loss: 0 }

    const updatedRecord = await Record.findOneAndUpdate(
      { name: name.toLowerCase() },
      { $push: { record: newRecord } }, // push new object into array
      { new: true }
    );

    if (!updatedRecord)
      return res
        .status(404)
        .json({ error: `Record with name '${name}' not found` });

    res.json({
      message: "New record added successfully!",
      record: updatedRecord,
    });
  } catch (err) {
    console.error("Error adding new record:", err);
    res.status(500).json({ error: "Failed to add record" });
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

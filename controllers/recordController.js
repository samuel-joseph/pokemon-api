import Record from "../models/recordModel.js";

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
    const { region, win = 0 } = req.body;

    // Validate required fields
    if (!region) {
      return res.status(400).json({ error: "Region is required." });
    }

    // Create the new record object
    const newRecord = { region: region.toLowerCase(), win };

    const updatedRecord = await Record.findOneAndUpdate(
      { name: name.toLowerCase() },
      { $push: { record: newRecord } },
      { new: true }
    );

    if (!updatedRecord) {
      return res
        .status(404)
        .json({ error: `Record with name '${name}' not found` });
    }

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
    const normalizedName = name.toLowerCase();
    const normalizedRegion = region.toLowerCase();

    // Try increment first
    let record = await Record.findOneAndUpdate(
      { name: normalizedName, "record.region": normalizedRegion },
      { $inc: { "record.$.win": 1 } },
      { new: true }
    );

    // If region not found, add it with win: 1
    if (!record) {
      record = await Record.findOneAndUpdate(
        { name: normalizedName },
        { $push: { record: { region: normalizedRegion, win: 1 } } },
        { new: true }
      );
    }

    if (!record) {
      return res.status(404).json({
        error: `Record for '${name}' not found.`,
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

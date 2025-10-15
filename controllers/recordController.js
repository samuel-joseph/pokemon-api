import Record from "../models/Record.js";

export const addRecord = async (req, res) => {
  try {
    const newRecord = new Record({
      ...req.body,
      user: req.userId,
    });

    await newRecord.save();
    res
      .status(201)
      .json({ message: "Record added successfully!", record: newRecord });
  } catch (err) {
    console.error("Error saving record:", err);
    res.status(500).json({ error: "Failed to save record" });
  }
};

export const getRecord = async (req, res) => {
  try {
    const records = await Record.find();
    const name = req.params.name;
    if (name) {
      const profile = records.find((data) => data.name === name.toLowerCase());
      if (!profile) return res.json({ error: "Profile not found" });
      return res.json(profile);
    }
    res.json(records);
  } catch (err) {
    console.error("Error fetching records:", err);
    res.status(500).json({ error: "Failed to fetch records" });
  }
};

export const updateRecord = async (req, res) => {
  try {
    const { name } = req.params;
    const updatedData = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name parameter is required" });
    }

    const record = await Record.findOneAndUpdate(
      { name: name },
      updatedData,
      { new: true } // returns the updated document
    );

    if (!record) {
      return res
        .status(404)
        .json({ error: `Record with name '${name}' not found` });
    }

    res.json({
      message: "Record updated successfully!",
      data: record,
    });
  } catch (err) {
    console.error("Error updating record:", err);
    res.status(500).json({ error: "Failed to update record" });
  }
};

export const deleteRecord = async (req, res) => {
  try {
    const { name } = req.params;

    if (!name) {
      return res.status(400).json({ error: "Name parameter is required" });
    }

    const record = await Record.findOneAndDelete({ name: name });

    if (!record) {
      return res
        .status(404)
        .json({ error: `Record with name '${name}' not found` });
    }

    res.json({
      message: "Record deleted successfully!",
      deletedRecord: record,
    });
  } catch (err) {
    console.error("Error deleting record:", err);
    res.status(500).json({ error: "Failed to delete record" });
  }
};

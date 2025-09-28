const express = require("express");
const fs = require("fs");
const path = require("path");
const pokemonRoutes = require("./routes/pokemonRoutes");
// const moveRoutes = require("./routes/moveRoutes");
const { fetchAndStoreData } = require("./services/pokemonServices");

const app = express();
const port = 3000;

const DATA_FILE = path.join(__dirname, "data.json");

app.use("/api", pokemonRoutes);
// app.use("/api/moves", moveRoutes);

app.listen(port, async () => {
  console.log(`✅ Server running at http://localhost:${port}`);

  if (!fs.existsSync(DATA_FILE)) {
    console.log("No cache found, fetching data...");
    await fetchAndStoreData();
    console.log("Data cached!");
  }
});

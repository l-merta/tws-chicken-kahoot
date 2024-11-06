const express = require("express");
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5200;

// Use CORS middleware
app.use(cors());

// Slouží statické soubory z Reactu
app.use(express.static("public"));

// API route, která vrací JSON objekt
app.get("/api", (req, res) => {
  res.json({ "api": "Hello World" });
});

// Obsluhuje všechny ostatní cesty a vrací hlavní HTML soubor
app.get("*", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
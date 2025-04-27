const express = require("express");
const fs = require("fs");
const dotenv = require("dotenv");
const dmRoutes = require("./routes/dmRoutes.js");
const webhookRoutes = require("./routes/webhookRoutes.js");
const logRoutes = require("./routes/logRoutes.js");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use(dmRoutes);
app.use(webhookRoutes);
app.use(logRoutes);

// Privacy policy
app.get("/privacy_policy", (req, res) => {
  fs.readFile("public/privacy-policy.html", "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Privacy policy not found.");
    }
    res.send(data);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

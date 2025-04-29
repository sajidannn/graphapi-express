const express = require("express");
const fs = require("fs");
const dotenv = require("dotenv");
const cron = require("node-cron");
const { getLatestInstagramToken, refreshInstagramToken } = require("./services/instagramTokenService");
const { createLog } = require("./services/logService");
const dmRoutes = require("./routes/dmRoutes.js");
const webhookRoutes = require("./routes/webhookRoutes.js");
const logRoutes = require("./routes/logRoutes.js");
const instagramTokenRoutes = require("./routes/instagramTokenRoutes.js");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use(dmRoutes);
app.use(webhookRoutes);
app.use(logRoutes);
app.use(instagramTokenRoutes);

// Privacy policy
app.get("/privacy_policy", (req, res) => {
  fs.readFile("public/privacy-policy.html", "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Privacy policy not found.");
    }
    res.send(data);
  });
});

// cron job
cron.schedule("0 */12 * * *", async () => {
  await createLog(
    "INFO",
    "CRON_REFRESH_TOKEN_START",
    "Checking and refreshing Instagram access token..."
  );

  const token = await getLatestInstagramToken();

  if (!token) {
    await createLog(
      "WARN",
      "CRON_NO_TOKEN_FOUND",
      "No token found in database."
    );
    return;
  }

  const expiresInHours = (new Date(token.expiresAt) - new Date()) / (1000 * 60 * 60);

  if (expiresInHours < 24) {
    const result = await refreshInstagramToken(token.token);

    if (result.success === false) {
      await createLog(
        "ERROR",
        "CRON_REFRESH_FAILED",
        "Failed to refresh token.",
        [{ key: "error", value: JSON.stringify(result.error) }]
      );
    } else {
      await createLog(
        "INFO",
        "CRON_REFRESH_SUCCESS",
        "Token successfully refreshed and updated in DB.",
        [{ key: "newToken", value: result.token }]
      );
    }
  } else {
    await createLog(
      "INFO",
      "CRON_TOKEN_VALID",
      `Token is still valid (${expiresInHours.toFixed(2)}h remaining).`
    );
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

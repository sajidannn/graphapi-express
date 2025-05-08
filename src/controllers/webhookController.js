const { handleWebhookEvent } = require("../services/instagramService");

exports.verifyWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token && challenge) {
    res.status(200).send(challenge);
  } else {
    res.status(400).send("Invalid request");
  }
};

exports.receiveWebhook = async (req, res) => {
  try {
    console.log("Webhook POST received:");
    console.log(JSON.stringify(req.body, null, 2));

    await handleWebhookEvent(req.body);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error.response?.data || error.message);
  }
};

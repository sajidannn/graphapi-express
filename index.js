const express = require("express");
const fs = require("fs");
const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.get("/fetch_dm", async (req, res) => {
  try {
    const response = await axios.get("https://graph.instagram.com/v22.0/me/conversations", {
      params: {
        platform: "instagram",
        fields: "participant,from,message,messages{created_time,from,message,reactions,shares}",
        access_token: process.env.ACCESS_TOKEN,
      },
    });

    const data = response.data;

    if (data.data) {
      for (const convo of data.data) {
        if (convo.messages && convo.messages.data) {
          for (const msg of convo.messages.data) {
            const message = {
              id: msg.id,
              senderUsername: msg.from.username,
              senderId: msg.from.id,
              message: msg.message,
              createdTime: new Date(msg.created_time),
            };

            await prisma.dm.upsert({
              where: { id: message.id },
              update: {},
              create: message,
            });
          }
        }
      }
    }

    res.send("Fetched and saved messages successfully.");
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("Error fetching messages.");
  }
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token && challenge) {
    res.status(200).send(challenge);
  } else {
    res.status(400).send("Invalid request");
  }
});

app.post("/webhook", async (req, res) => {
  console.log("Webhook POST received:");
  console.log(JSON.stringify(req.body, null, 2));

  try {
    const messagingEvents = req.body.entry?.[0]?.messaging || [];

    for (const event of messagingEvents) {
      if (event.message?.is_echo) continue;
      const senderId = event.sender?.id;
      const messageText = event.message?.text;

      if (senderId && messageText) {
        // send message ke bot majadigi
        const chatbotResponse = await axios.post("https://api.majadigidev.jatimprov.go.id/api/external/chatbot/send-message", {
          question: messageText,
          additional_context: "",
          session_id: senderId
        }, {
          headers: {
            "Content-Type": "application/json"
          }
        });

        const chatbotText = chatbotResponse.data?.data?.message?.[0]?.text || "Maaf, tidak ada respons dari chatbot.";

        // kirim balik ke sender
        await axios.post(`https://graph.instagram.com/v22.0/me/messages`, {
          recipient: {
            id: senderId
          },
          message: {
            text: chatbotText
          }
        }, {
          headers: {
            Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
            "Content-Type": "application/json"
          }
        });

        console.log("Pesan dikirim kembali ke pengguna IG:", senderId);
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Error saat memproses webhook:", error.response?.data || error.message);
    res.sendStatus(500);
  }
});

app.get("/privacy_policy", (req, res) => {
  fs.readFile("privacy-policy.html", "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Privacy policy not found.");
    }
    res.send(data);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

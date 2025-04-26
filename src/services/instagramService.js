const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const { askChatbot } = require("./chatbotService");

const prisma = new PrismaClient();

exports.fetchAndSaveDMs = async () => {
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
};

exports.handleWebhookEvent = async (body) => {
  const messagingEvents = body.entry?.[0]?.messaging || [];

  for (const event of messagingEvents) {
    if (event.message?.is_echo) continue;

    const senderId = event.sender?.id;
    const messageText = event.message?.text;

    if (senderId && messageText) {
      const chatbotText = await askChatbot(messageText, senderId);

      await axios.post(`https://graph.instagram.com/v22.0/me/messages`, {
        recipient: { id: senderId },
        message: { text: chatbotText }
      }, {
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      });

      console.log("Pesan dikirim kembali ke pengguna IG:", senderId);
    }
  }
};

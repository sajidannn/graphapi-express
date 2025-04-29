const axios = require("axios");
const { askChatbot } = require("./chatbotService.js");
const { createLog } = require('./logService.js');
const prisma = require("../database/index.js");


exports.fetchDMs = async (after = null) => {
  try {
    let apiUrl = "https://graph.instagram.com/v22.0/me/conversations";
    let params = {
      platform: "instagram",
      fields: "participant,from,message,messages{created_time,from,message,reactions,shares}",
      access_token: process.env.ACCESS_TOKEN,
    };

    if (after) {
      params.after = after;
    }

    const response = await axios.get(apiUrl, { params });
    const data = response.data;

    let nextPage = null;
    if (data.paging?.cursors?.after) {
      const afterCursor = data.paging.cursors.after;
      nextPage = `${process.env.BASE_URL}/fetch_dm?after=${afterCursor}`;
    }

    return {
      success: true,
      messages: data.data || [],
      nextPage,
    };
  } catch (error) {
    return {
      success: false,
      messages: [],
      nextPage: null,
      error: error.response?.data || error.message,
    };
  }
};

exports.getConversations = async (filters) => {
  const { senderId, startDate, endDate } = filters;

  const whereClause = {};

  if (senderId) {
    whereClause.senderId = senderId;
  }

  if (startDate && endDate) {
    whereClause.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate)
    };
  } else if (startDate) {
    whereClause.createdAt = {
      gte: new Date(startDate)
    };
  } else if (endDate) {
    whereClause.createdAt = {
      lte: new Date(endDate)
    };
  }

  const conversations = await prisma.conversation.findMany({
    where: whereClause,
    orderBy: {
      createdAt: 'desc'
    }
  });

  return conversations;
};

exports.handleWebhookEvent = async (body) => {
  const messagingEvents = body.entry?.[0]?.messaging || [];

  for (const event of messagingEvents) {
    if (event.message?.is_echo) continue;

    const senderId = event.sender?.id;
    const messageText = event.message?.text;

    if (senderId && messageText) {
      await createLog(
        'INFO',
        'WEBHOOK_RECEIVED',
        'Pesan diterima dari pengguna',
        [
          { key: 'senderId', value: senderId },
          { key: 'messageText', value: messageText }
        ]
      );

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

      await createLog(
        'INFO',
        'WEBHOOK_RESPONSE_SENT',
        'Pesan balasan berhasil dikirim ke pengguna',
        [
          { key: 'senderId', value: senderId },
          { key: 'responseText', value: chatbotText }
        ]
      );

      await prisma.conversation.create({
        data: {
          senderId: senderId,
          messageText: messageText,
          botReply: chatbotText,
          createdAt: new Date(),
        },
      });
    }
  }
};

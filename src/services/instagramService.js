const axios = require("axios");
const { askChatbot } = require("./chatbotService.js");
const { createLog } = require('./logService.js');
const { getLatestInstagramToken } = require('./instagramTokenService');
const prisma = require("../database/index.js");


exports.fetchDMs = async (after = null) => {
  try {
    const latest = await getLatestInstagramToken();

    if (!latest || !latest.token) {
      throw new Error('Instagram access token not found in database.');
    }

    const apiUrl = "https://graph.instagram.com/v22.0/me/conversations";
    const params = {
      platform: "instagram",
      fields: "participant,from,message,messages{created_time,from,message,reactions,shares}",
      access_token: latest.token,
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
    whereClause.userId = senderId;
  }

  if (startDate && endDate) {
    whereClause.lastDate = {
      gte: new Date(startDate),
      lte: new Date(endDate)
    };
  } else if (startDate) {
    whereClause.lastDate = {
      gte: new Date(startDate)
    };
  } else if (endDate) {
    whereClause.lastDate = {
      lte: new Date(endDate)
    };
  }

  const conversations = await prisma.conversation.findMany({
    where: whereClause,
    orderBy: {
      lastDate: 'desc'
    },
    include: {
      messages: {
        orderBy: { sentAt: 'asc' } // Urutkan pesan dalam conversation
      },
    }
  });

  return conversations;
};

exports.handleWebhookEvent = async (body) => {
  const messagingEvents = body.entry?.[0]?.messaging || [];

  for (const event of messagingEvents) {
    const isEcho = event.message?.is_echo;
    const senderId = event.sender?.id;
    const messageText = event.message?.text;
    const timestamp = new Date(event.timestamp);

    if (senderId && messageText) {
      // skip echo jika masuk via bot
      if (isEcho) continue;

      await createLog('INFO', 'WEBHOOK_RECEIVED', 'Pesan diterima dari pengguna', [
        { key: 'senderId', value: senderId },
        { key: 'messageText', value: messageText }
      ]);

      // Cari conversation berdasarkan userId (Instagram senderId)
      let conversation = await prisma.conversation.findFirst({
        where: { userId: senderId },
      });

      // Jika belum ada, buat conversation baru
      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            userId: senderId,
            username: `user-${senderId}`, // bisa diganti jika ada cara ambil nama asli
            lastMessage: messageText,
            lastDate: timestamp,
          },
        });
      }

      // Simpan pesan user
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderType: 'user',
          content: messageText,
          readStatus: 'unread',
          sentAt: timestamp,
        },
      });

      const chatbotText = await askChatbot(messageText, senderId);
      const latest = await getLatestInstagramToken();

      if (!latest || !latest.token) {
        await createLog('ERROR', 'WEBHOOK_TOKEN_MISSING', 'Instagram access token not found.', [
          { key: 'senderId', value: senderId },
        ]);
        continue;
      }

      try {
        // Kirim balasan ke IG
        await axios.post(`https://graph.instagram.com/v22.0/me/messages`, {
          recipient: { id: senderId },
          message: { text: chatbotText }
        }, {
          headers: {
            Authorization: `Bearer ${latest.token}`,
            "Content-Type": "application/json"
          }
        });

        await createLog('INFO', 'WEBHOOK_RESPONSE_SENT', 'Balasan terkirim ke user', [
          { key: 'senderId', value: senderId },
          { key: 'responseText', value: chatbotText }
        ]);

        // Simpan balasan bot
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            senderType: 'bot',
            content: chatbotText,
            readStatus: 'unread',
            sentAt: new Date(),
          },
        });

        // Update conversation terakhir
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            lastMessage: chatbotText,
            lastDate: new Date(),
          },
        });

      } catch (err) {
        await createLog('ERROR', 'WEBHOOK_SEND_FAILED', 'Gagal kirim balasan ke user', [
          { key: 'senderId', value: senderId },
          { key: 'error', value: err.response?.data?.error?.message || err.message }
        ]);
        continue;
      }
    }

    // Jika event adalah read receipt
    if (event.read?.mid && senderId) {
      // Tandai semua pesan bot sebagai 'read' di conversation user
      const conv = await prisma.conversation.findFirst({
        where: { userId: senderId },
      });

      if (conv) {
        await prisma.message.updateMany({
          where: {
            conversationId: conv.id,
            senderType: 'bot',
            readStatus: 'unread',
          },
          data: { readStatus: 'read' },
        });
      }
    }
  }
};


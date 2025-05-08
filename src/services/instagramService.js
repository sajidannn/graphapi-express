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

// Fungsi utilitas untuk mengirim pesan ke Instagram
const sendInstagramMessage = async (recipientId, messageText, token) => {
  try {
    const response = await axios.post(
      `https://graph.instagram.com/v22.0/me/messages`,
      {
        recipient: { id: recipientId },
        message: { text: messageText }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    throw new Error(error.response?.data?.error?.message || error.message);
  }
};

// Fungsi utilitas untuk mengelola conversation
const manageConversation = async (userId, messageText, senderType = 'user') => {
  return await prisma.$transaction(async (prisma) => {
    // Upsert conversation
    const conversation = await prisma.conversation.upsert({
      where: { userId },
      update: {
        lastMessage: messageText,
        lastDate: new Date(),
      },
      create: {
        userId,
        username: `user-${userId}`,
        lastMessage: messageText,
        lastDate: new Date(),
      },
    });

    // Simpan pesan
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderType,
        content: messageText,
        readStatus: 'unread',
        sentAt: new Date(),
      },
    });

    return conversation;
  });
};

exports.handleWebhookEvent = async (body) => {
  const messagingEvents = body.entry?.[0]?.messaging || [];

  for (const event of messagingEvents) {
    const isEcho = event.message?.is_echo;
    const senderId = event.sender?.id;
    const messageText = event.message?.text;

    if (senderId && messageText) {
      try {
        // Validasi dasar
        if (isEcho) continue;
        await createLog('INFO', 'WEBHOOK_RECEIVED', 'Pesan diterima dari pengguna', [
          { key: 'senderId', value: senderId },
          { key: 'messageText', value: messageText }
        ]);

        // Kelola conversation dan simpan pesan user
        await manageConversation(senderId, messageText, 'user');

        // Dapatkan respon chatbot
        const chatbotText = await askChatbot(messageText, senderId);
        const latestToken = await getLatestInstagramToken();

        if (!latestToken?.token) {
          throw new Error('Instagram access token not found');
        }

        // Kirim pesan ke Instagram
        await sendInstagramMessage(senderId, chatbotText, latestToken.token);

        // Simpan pesan bot dan update conversation
        await manageConversation(senderId, chatbotText, 'bot');

        await createLog('INFO', 'WEBHOOK_RESPONSE_SENT', 'Balasan terkirim ke user', [
          { key: 'senderId', value: senderId },
          { key: 'responseText', value: chatbotText }
        ]);

      } catch (error) {
        await createLog('ERROR', 'WEBHOOK_PROCESS_FAILED', 'Gagal memproses webhook', [
          { key: 'senderId', value: senderId },
          { key: 'error', value: error.message }
        ]);
      }
    }

    // Jika event adalah read receipt
    if (event.read?.mid && senderId) {
      try {
        await prisma.message.updateMany({
          where: {
            conversation: { userId: senderId },
            senderType: { in: ['bot', 'user-admin'] },
            readStatus: 'unread',
          },
          data: { readStatus: 'read' },
        });
      } catch (error) {
        await createLog('ERROR', 'READ_RECEIPT_FAILED', 'Gagal update read receipt', [
          { key: 'senderId', value: senderId },
          { key: 'error', value: error.message }
        ]);
      }
    }
  }
};

exports.sendManualMessageToUser = async (userId, text, senderType = 'user-admin') => {
  try {
    const latestToken = await getLatestInstagramToken();
    if (!latestToken?.token) {
      throw new Error('Instagram access token not found');
    }

    // Kirim pesan ke Instagram
    await sendInstagramMessage(userId, text, latestToken.token);

    // Kelola conversation
    await manageConversation(userId, text, senderType);

    await createLog('INFO', 'MANUAL_MESSAGE_SENT', 'Pesan manual terkirim', [
      { key: 'userId', value: userId },
      { key: 'text', value: text }
    ]);

    return { success: true, message: 'Pesan berhasil dikirim' };
  } catch (error) {
    await createLog('ERROR', 'MANUAL_MESSAGE_FAILED', 'Gagal mengirim pesan manual', [
      { key: 'userId', value: userId },
      { key: 'error', value: error.message }
    ]);
    return { success: false, message: error.message };
  }
};

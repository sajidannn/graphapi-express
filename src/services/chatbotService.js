const axios = require("axios");
const { createLog } = require('./logService.js');

exports.askChatbot = async (question, sessionId) => {
  try {
    const response = await axios.post(
      "https://api.majadigidev.jatimprov.go.id/api/external/chatbot/send-message",
      {
        question,
        additional_context: "",
        session_id: sessionId
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const chatbotText = response.data?.data?.message?.[0]?.text || "Maaf, tidak ada respons dari chatbot.";

    await createLog(
      'INFO',
      'ASK_CHATBOT_SUCCESS",',
      'Berhasil mendapat respons dari chatbot',
      [
        { key: "sessionId", value: sessionId },
        { key: "question", value: question },
        { key: "chatbotResponse", value: chatbotText }
      ]
    );

    return chatbotText;
  } catch (error) {
    await createLog(
      'ERROR',
      'ASK_CHATBOT_ERROR",',
      'Gagal menghubungi chatbot',
      [
        { key: "sessionId", value: sessionId },
        { key: "question", value: question },
        { key: "chatbotResponse", value: chatbotText }
      ]
    );

    throw error;
  }
};

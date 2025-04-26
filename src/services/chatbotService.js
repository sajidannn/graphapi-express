const axios = require("axios");

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
    return chatbotText;
  } catch (error) {
    console.error("Error contacting chatbot service:", error.response?.data || error.message);
    throw error;
  }
};

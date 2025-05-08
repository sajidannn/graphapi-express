const { fetchDMs, getConversations, sendManualMessageToUser } = require("../services/instagramService.js");

exports.fetchDMs = async (req, res) => {
  try {
    const { after } = req.query;
    const response = await fetchDMs(after);

    if (response.success) {
      res.status(200).send({
        success: true,
        data: response.messages,
        nextPage: response.nextPage,
      });
    } else {
      res.status(500).send({
        success: false,
        error: response.error || "An error occurred while fetching messages", // Return error details
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message || "An internal server error occurred",
    });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const filters = req.query;
    const conversations = await getConversations(filters);

    return res.status(200).send({
      success: true,
      data: conversations,
    });
  } catch (error) {
    res.status(500).send(error.response?.data || error.message);
  }
}

exports.sendMessageController = async (req, res) => {
  const { userId, text } = req.body;
  const senderType = req.body.senderType || 'user-admin'; // Default senderType

  // Validasi input
  if (!userId || !text) {
    return res.status(400).json({
      success: false,
      message: 'userId dan text diperlukan'
    });
  }

  try {
    const result = await sendManualMessageToUser(userId, text, senderType);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Pesan berhasil dikirim',
        data: result
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Gagal mengirim pesan',
        error: result.message
      });
    }
  } catch (error) {
    console.error('Error in sendMessageController:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};
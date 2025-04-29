const { fetchDMs, getConversations } = require("../services/instagramService.js");

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
const { fetchAndSaveDMs } = require("../services/instagramService.js");

exports.fetchDMs = async (req, res) => {
  try {
    await fetchAndSaveDMs();
    res.send("Fetched and saved messages successfully.");
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send("Error fetching messages.");
  }
};

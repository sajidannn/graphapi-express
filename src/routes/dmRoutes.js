const express = require("express");
const { fetchDMs, getConversations, sendMessageController } = require("../controllers/dmController.js");
const router = express.Router();

router.get("/fetch_dm", fetchDMs);
router.get("/get_conversation", getConversations);
router.post('/messages/send', sendMessageController);

module.exports = router;

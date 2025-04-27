const express = require("express");
const { fetchDMs, getConversations } = require("../controllers/dmController.js");
const router = express.Router();

router.get("/fetch_dm", fetchDMs);
router.get("/get_conversation", getConversations);

module.exports = router;

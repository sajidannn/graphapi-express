const express = require("express");
const { fetchDMs } = require("../controllers/dmController.js");
const router = express.Router();

router.get("/fetch_dm", fetchDMs);

module.exports = router;

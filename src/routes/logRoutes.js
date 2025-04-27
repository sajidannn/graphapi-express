const express = require("express");
const { getLogs } = require("../controllers/logController.js");
const router = express.Router();

router.get("/get_log", getLogs);

module.exports = router;

const express = require('express');
const router = express.Router();
const { handleRefreshToken } = require('../controllers/instagramTokenController.js');

router.get('/refresh_token', handleRefreshToken);

module.exports = router;

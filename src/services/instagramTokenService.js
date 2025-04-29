const prisma = require('../database/index.js');
const axios = require("axios");

exports.refreshInstagramToken = async (currentToken) => {
  try {
    const res = await axios.get('https://graph.instagram.com/refresh_access_token', {
      params: {
        grant_type: 'ig_refresh_token',
        access_token: currentToken,
      },
    });

    const { access_token, token_type, expires_in, permissions } = res.data;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expires_in * 1000);

    const savedToken = await prisma.instagramToken.upsert({
      where: { token: access_token },
      update: {
        tokenType: token_type,
        expiresIn: expires_in,
        permissions: permissions,
        createdAt: now,
        expiresAt,
      },
      create: {
        token: access_token,
        tokenType: token_type,
        expiresIn: expires_in,
        permissions: permissions,
        createdAt: now,
        expiresAt,
      },
    });

    return savedToken;
  } catch (err) {
    return {
      success: false,
      error: err.response?.data || err.message,
    };
  }
}
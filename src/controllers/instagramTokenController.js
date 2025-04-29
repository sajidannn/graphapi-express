const { refreshInstagramToken } = require('../services/instagramTokenService');

exports.handleRefreshToken = async (req, res) => {
  try {
    const { access_token } = req.query;

    if (!access_token) {
      return res.status(400).json({ error: 'Missing access_token in query' });
    }

    const result = await refreshInstagramToken(access_token);

    if (result.success === false) {
      return res.status(500).json(result.error);
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unexpected error occurred' });
  }
};

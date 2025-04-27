const { fetchLogs } = require('../services/logService.js');

exports.getLogs = async (req, res) => {
  try {
    const filters = req.query;
    const response = await fetchLogs(filters);

    return res.status(200).json({
      success: true,
      data: response.logs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error',
    });
  }
};

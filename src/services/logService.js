const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createLog = async (level, codeRef, message, metadata = []) => {
  const logEntry = await prisma.logEntry.create({
    data: {
      timestamp: new Date(),
      level,
      code_ref: codeRef,
      message,
      log_Metadata: {
        create: metadata.map(item => ({
          key: item.key,
          value: item.value
        }))
      }
    },
    include: {
      log_Metadata: true
    }
  });

  return logEntry;
};

exports.fetchLogs = async (filters) => {
  try {
    const { code_ref, timestampStart, timestampEnd } = filters;

    const whereClause = {};

    if (code_ref) {
      whereClause.code_ref = code_ref;
    }

    if (timestampStart && timestampEnd) {
      whereClause.timestamp = {
        gte: new Date(timestampStart),
        lte: new Date(timestampEnd),
      };
    } else if (timestampStart) {
      whereClause.timestamp = {
        gte: new Date(timestampStart),
      };
    } else if (timestampEnd) {
      whereClause.timestamp = {
        lte: new Date(timestampEnd),
      };
    }

    const logs = await prisma.logEntry.findMany({
      where: whereClause,
      include: {
        log_Metadata: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return {
      success: true,
      logs,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An error occurred while fetching logs.',
    };
  }
};

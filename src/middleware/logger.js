/**
 * 日志模块 - P1-02: 统一日志使用
 */
const winston = require('winston');
const path = require('path');

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
      let log = `${timestamp} [${level.toUpperCase()}] ${message}`;
      if (Object.keys(meta).length > 0) log += ` ${JSON.stringify(meta)}`;
      if (stack) log += `\n${stack}`;
      return log;
    })
  ),
  defaultMeta: { service: 'ariba-assistant' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize({ all: true }))
    })
  ]
});

logger.logRequest = (req, res, duration) => {
  const logData = { method: req.method, path: req.path, status: res.statusCode, duration: `${duration}ms` };
  res.statusCode >= 400 ? logger.warn('HTTP Request', logData) : logger.info('HTTP Request', logData);
};

logger.logError = (context, error) => {
  logger.error(context, { message: error.message, stack: error.stack, code: error.code });
};

console.log('Logger initialized, level:', LOG_LEVEL);
module.exports = logger;

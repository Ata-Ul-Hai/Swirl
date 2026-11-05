import winston from "winston";

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

const isProd = process.env.NODE_ENV === "production";

// Human-readable dev format
const devFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  return `${timestamp} [${level}]: ${stack || message}${metaStr}`;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isProd ? "info" : "debug"),
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    isProd ? json() : combine(colorize(), devFormat)
  ),
  defaultMeta: { service: "swirl-api" },
  transports: [
    new winston.transports.Console(),
  ],
});

/**
 * Express HTTP Request Logger Middleware
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress,
    };

    if (res.statusCode >= 500) {
      logger.error("HTTP Request Error", logData);
    } else if (res.statusCode >= 400) {
      logger.warn("HTTP Client Error", logData);
    } else {
      logger.info("HTTP Request", logData);
    }
  });
  next();
};

export default logger;

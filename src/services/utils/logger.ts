import winston from 'winston';

/**
 * Singleton logger wrapping winston.
 * Use Logger.getInstance() throughout services and workflows.
 */
export class Logger {
  private static instance: Logger;
  private readonly logger: winston.Logger;

  private constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL ?? 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
          return `[${String(timestamp)}] ${level}: ${String(message)}${metaStr}`;
        }),
      ),
      transports: [new winston.transports.Console()],
    });
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  info(message: string, meta?: object): void {
    this.logger.info(message, meta);
  }

  debug(message: string, meta?: object): void {
    this.logger.debug(message, meta);
  }

  warn(message: string, meta?: object): void {
    this.logger.warn(message, meta);
  }

  error(message: string, meta?: object): void {
    this.logger.error(message, meta);
  }
}

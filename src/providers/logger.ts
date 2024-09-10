import { createLogger, format, transports } from "winston";
import type { Logger } from "winston";
import { ILog } from "../interfaces/log";
import LokiTransport from "winston-loki";

/**
 * @class Log
 * @description This class is used to initialize the logger
 * @returns Logger of type winston
 */
class Log implements ILog {
  private readonly logger: Logger;
  private lokiURL: string = process.env.LOKI_URL || "http://loki:3100";

  constructor(level: string = "info") {
    this.logger = createLogger({
      level: level,
      format: format.combine(
        format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss",
        }),
        format.errors({ stack: true }),
        format.json(),
        format.prettyPrint(),
        format.colorize(),
      ),
      transports: [
        new transports.File({ filename: "logs/error.log", level: "error" }),
        new transports.File({ filename: "logs/combined.log" }),
        new LokiTransport({
          host: this.lokiURL,
          json: true,
          labels: { job: "node-app", env: "production" },
        }),
      ],
    });

    this.logger.add(
      new transports.Console({
        format: format.simple(),
      }),
    );
  }

  /**
   * @method info
   * @description Log info message
   * @param {string} message
   * @returns void
   */
  public info(service: string, message: string) {
    message = `[${service}] ${message}`;
    this.logger.info(message);
  }

  /**
   * @method error
   * @description Log Error Messages
   * @param {string} message
   * @returns void
   */
  public error(service: string, error: any) {
    error = `[${service}] ${error}`;
    this.logger.error(error);
  }

  /**
   * @method debug
   * @description Log debug messages
   * @param {string} message
   */
  public debug(service: string, message: string) {
    message = `[${service}] ${message}`;
    this.logger.debug(message);
  }
}

export default new Log();

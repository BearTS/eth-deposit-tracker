import { createLogger, format, transports } from "winston";
import type { Logger } from "winston";
import { ILog } from "../interfaces/log";

/**
 * @class Log
 * @description This class is used to initialize the logger
 * @returns Logger of type winston
 */
class Log implements ILog {
  private readonly logger: Logger;

  constructor() {
    this.logger = createLogger({
      level: "info",
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
}

export default new Log();

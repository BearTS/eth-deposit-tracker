import { Telegraf } from "telegraf";
import { INotify } from "../interfaces/notify";
import { ILog } from "../interfaces/log";

/**
 * @interface ITelegramConfig
 * @description Interface for Telegram Configuration
 */
interface ITelegramConfig {
  token: string;
  chatId: string;
}

// TODO: Rate limit fix, could maintain a message queue?
/**
 * @class Telegram
 * @description This class is used to send notifications to Telegram
 * @returns an instance of Telegram Bot
 */
export class Telegram implements INotify {
  private client: Telegraf;
  private log: ILog;
  private chatId: string;
  private service: string = "Telegram Notification";
  private MaxCharacters = 3096; // In case the message is too long

  constructor(config: ITelegramConfig, log: ILog) {
    this.chatId = config.chatId;
    this.log = log;
    this.client = new Telegraf(config.token);
  }
  public async notify(message: string, service: string): Promise<void> {
    try {
      if (message.length > this.MaxCharacters) {
        const chunks = this.splitMessage(message, this.MaxCharacters);
        this.log.debug(
          this.service,
          `Message too long, splitting into ${chunks.length} chunks`,
        );
        for (const chunk of chunks) {
          let msg = `[${service}] ${chunk}`;
          await this.client.telegram.sendMessage(this.service, msg);
        }
      } else {
        message = `[${service}] ${message}`;
        await this.client.telegram.sendMessage(this.chatId, message);
        this.log.info(this.service, "Message sent to Telegram");
      }
    } catch (error) {
      this.log.error(this.service, error);
    }
  }

  /**
   * Splits a message into chunks of a maximum length.
   * @param message - The message to be split.
   * @param maxCharacters - The maximum length of each chunk.
   * @returns An array of message chunks.
   */
  private splitMessage(message: string, maxCharacters: number): string[] {
    // Validate input
    if (maxCharacters <= 0) {
      throw new Error("maxCharacters must be greater than 0");
    }

    // If message length is less than or equal to maxCharacters, no need to split
    if (message.length <= maxCharacters) {
      return [message];
    }

    const chunks: string[] = [];
    for (let i = 0; i < message.length; i += maxCharacters) {
      chunks.push(message.slice(i, i + maxCharacters));
    }

    return chunks;
  }
}

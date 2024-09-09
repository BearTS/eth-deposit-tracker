import { Telegraf } from "telegraf";
import log from "./logger";
import { INotify } from "../types/notify";

/**
 * @interface ITelegramConfig
 * @description Interface for Telegram Configuration
 */
interface ITelegramConfig {
    token: string;
    chatId: string;
}

/**
 * @class Telegram
 * @description This class is used to send notifications to Telegram
 * @returns an instance of Telegram Bot
 */
export class Telegram implements INotify {
  private client: Telegraf;
  private chatId: string;
  private service: string = "Telegram Notification";

  constructor(config: ITelegramConfig) {
    this.chatId = config.chatId;
    this.client = new Telegraf(config.token);
  }
  public async notify(message: string, service: string): Promise<void> {
    try {
      message = `[${service}] ${message}`;
      await this.client.telegram.sendMessage(this.chatId, message);
      log.info(this.service, "Message sent to Telegram");
    } catch (error) {
      log.error(this.service, error);
    }
  }
}
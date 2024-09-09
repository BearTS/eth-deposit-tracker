import { Telegraf } from "telegraf";
import log from "../utils/log";
import { type INotify } from "../types/types.classes";

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

  constructor(config: ITelegramConfig) {
    this.chatId = config.chatId;
    this.client = new Telegraf(config.token);
  }
  public async notify(message: string): Promise<void> {
    try {
      await this.client.telegram.sendMessage(this.chatId, message);
      log.info("Message sent to Telegram");
    } catch (error) {
      log.error(error);
    }
  }
}



// Only for testing purposes
import { Telegram } from "./providers/Telegram";
import config from "./config";
import log from "./utils/log"
  // Create an instance of the Telegram class
const telegramNotifier = new Telegram({
    token: config.TELEGRAM_BOT_TOKEN,
    chatId: config.TELEGRAM_CHAT_ID
  });  

// Notify a message

telegramNotifier.notify("Hello, World!").then(() => {
    log.info("Message sent to Telegram");
}).catch((error) => {
    log.error(error);
})


// Only for testing purposes
import { Telegram } from "./providers/telegram";
import config from "./config";
import log from "./providers/logger"
import MongoDatabase from "./providers/mongoDB";
import { DepositModel } from './models/deposit';
import { Deposit, DepositSchema } from "./schemas/deposit";

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

// Create an instance of the MongoDB class
const mongoDatabase = new MongoDatabase({
    uri: config.MONGO_URI
  });

// Initialize the database
mongoDatabase.init();

const deposit: Deposit = {
    blockNumber: 1,
    blockTimestamp: 1,
    fee: BigInt(1),
    hash: "hash",
    pubkey: "pubkey"
}

async function saveDeposit(deposit: Deposit) {
    DepositSchema.parse(deposit);

    const depositModel = new DepositModel(deposit);

    await depositModel.save();
}


saveDeposit(deposit).then(c => {
  log.info("done")
}).catch(e => {
  log.error(e)
})
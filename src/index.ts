import { EthereumProvider } from "./providers/ethProvider";
import config from "./config";
import { DepositsTracker } from "./apps/tracker";
import { Telegram } from "./providers/telegram";
import { DepositRepository } from './repositories/depositRepository';
import { DepositModel } from "./models/deposit";
import MongoDatabase from "./providers/mongoDB";
import { log } from "winston";
import logger from "./providers/logger";

const mongo = new MongoDatabase({ uri: config.MONGO_URI });
mongo.init();

const txHash = "0x1ecad2874a871dd3ec8e58e653a8cf4a396c4f7f14e3f700acc710cacda83b7e"

const ethProvider = new EthereumProvider({ rpcUrl: config.RPC_URL });

ethProvider.getTransaction(txHash).then((tx) => {
    console.log(tx);
});

const notify = new Telegram({
    token: config.TELEGRAM_BOT_TOKEN,
    chatId: config.TELEGRAM_CHAT_ID,
})

const depositRepo = new DepositRepository(DepositModel);
const deposTracker = new DepositsTracker(notify, logger, ethProvider, depositRepo);
deposTracker.trackBlockTransactions(1000);
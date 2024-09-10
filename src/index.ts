import { EthereumProvider } from "./providers/ethProvider";
import config from "./config";
import { DepositsTracker } from "./apps/tracker";
import { Telegram } from "./providers/telegram";
import { DepositRepository } from './repositories/depositRepository';
import { DepositModel } from "./models/deposit";
import MongoDatabase from "./providers/mongoDB";
import logger from "./providers/logger";

const mongo = new MongoDatabase({ uri: config.MONGO_URI }, logger);
mongo.init();

const ethProvider = new EthereumProvider({ rpcUrl: config.RPC_URL }, logger);

const notify = new Telegram({
    token: config.TELEGRAM_BOT_TOKEN,
    chatId: config.TELEGRAM_CHAT_ID,
}, logger)

const depositRepo = new DepositRepository(DepositModel);
const deposTracker = new DepositsTracker(notify, logger, ethProvider, depositRepo);
deposTracker.startNewBlocksListener();
import { EthereumProvider } from "./providers/ethProvider";
import config from "./config";
import { DepositsTracker } from "./apps/tracker";
import { Telegram } from "./providers/telegram";
import { DepositRepository } from "./repositories/depositRepository";
import { DepositModel } from "./models/deposit";
import MongoDatabase from "./providers/mongoDB";
import logger from "./providers/logger";

logger.info("Application", "Starting the application");
const mongo = new MongoDatabase({ uri: config.MONGO_URI }, logger);
mongo.init();

const ethProvider = new EthereumProvider({ rpcUrl: config.RPC_URL }, logger);

const notify = new Telegram(
  {
    token: config.TELEGRAM_BOT_TOKEN,
    chatId: config.TELEGRAM_CHAT_ID,
  },
  logger,
);

const from = config.FROM_ADDRESS.split(",");

const depositRepo = new DepositRepository(DepositModel);
const deposTracker = new DepositsTracker(
  notify,
  logger,
  ethProvider,
  depositRepo,
  from,
);
deposTracker.startNewBlocksListener();

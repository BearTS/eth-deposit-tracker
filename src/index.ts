import { EthereumProvider } from "./providers/ethProvider";
import config from "./config";
import { DepositsTracker } from "./apps/tracker";
import { Telegram } from "./providers/telegram";
import { DepositRepository } from "./repositories/depositRepository";
import { DepositModel } from "./models/deposit";
import MongoDatabase from "./providers/mongoDB";
import logger from "./providers/logger";

async function startApplication() {
  let from: string = [];
  if (config.FROM_ADDRESS) {
    from = config.FROM_ADDRESS.split(",");
  }
  logger.info("Application", "Starting the application");
  try {
    // Initialize Telegram notifier
    const notify = new Telegram(
      {
        token: config.TELEGRAM_BOT_TOKEN,
        chatId: config.TELEGRAM_CHAT_ID,
      },
      logger,
    );

    // Initialize MongoDB
    const db = new MongoDatabase({ uri: config.MONGO_URI }, logger);
    await db.init();
    const depositRepo = new DepositRepository(DepositModel);

    // Initialize Ethereum provider
    const ethProvider = new EthereumProvider(
      { rpcUrl: config.RPC_URL },
      logger,
    );

    // Setup the deposit tracker
    const deposTracker = new DepositsTracker(
      notify,
      logger,
      ethProvider,
      depositRepo,
      from,
    );

    // Start listening for new blocks
    await deposTracker.startNewBlocksListener();
  } catch (err) {
    logger.error("Application", `Failed to start application: ${err.message}`);
    process.exit(1); // Exit the process with an error code
  }
}

// Start the application
startApplication();

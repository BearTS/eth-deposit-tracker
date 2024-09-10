import { EthereumProvider } from "./providers/ethProvider";
import config from "./config";
import { Telegram } from "./providers/Telegram";
import { DepositRepository } from "./repositories/depositRepository";
import { DepositModel } from "./models/deposit";
import MongoDatabase from "./providers/mongoDB";
import logger from "./providers/logger";
import Express from "./apps/api";

async function startApplication() {
  logger.info("Application", "Starting the application");
  try {
    // Initialize Telegram notifier
    const telegramNotifier = new Telegram(
      {
        token: config.TELEGRAM_BOT_TOKEN,
        chatId: config.TELEGRAM_CHAT_ID,
      },
      logger,
    );

    // Initialize MongoDB
    const db = new MongoDatabase({ uri: config.MONGO_URI }, logger);
    db.init();
    const depositRepo = new DepositRepository(DepositModel);

    // Initialize Ethereum provider
    const ethProvider = new EthereumProvider(
      { rpcUrl: config.RPC_URL },
      logger,
    );

    // Setup the deposit tracker api
    // TODO: Extend the api for frontend app?
    const express = new Express(
      logger,
      depositRepo,
      telegramNotifier,
      ethProvider,
    );
    await express.init();
  } catch (err) {
    logger.error("Application", `Failed to start application: ${err.message}`);
    process.exit(1); // Exit the process with an error code
  }
}

// Start the application
startApplication();

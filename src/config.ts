import dotenv from "dotenv";
dotenv.config()

// Configuration for the app, taken from the environment variables
const config = {
    PORT: process.env.PORT || 3000,
    
    MONGO_URI: process.env.MONGO_URI || "mongodb://user:password@localhost:27017/deposits",

    // Telegram bot configuration
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN!,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID!,

    // Ethereum configuration
    RPC_URL: process.env.RPC_URL!,
}


export default config;
import mongoose from "mongoose";
import log from "./logger";

interface IMongoConfig {
    uri: string;
}

/**
 * @class Database
 * @description This class is used to initialize the database
 */
export class MongoDatabase {
    private uri: string;

    constructor(config: IMongoConfig) {
        this.uri = config.uri;
    }
  /**
   * @method init
   * @description This function is used to initialize the database
   * @returns void
   */
  public init(): void {
    mongoose.connect(this.uri);
        
    mongoose.connection.on("error", (err: any) => {
        log.error('MongoDB connection error: ' + err);
      process.exit();
    });
    mongoose.connection.on("connected", () => {
        log.info("Connected to MongoDB");
    });
    mongoose.connection.on("disconnected", () => {
        log.info("Disconnected from MongoDB");
    });
  }
}

export default MongoDatabase;
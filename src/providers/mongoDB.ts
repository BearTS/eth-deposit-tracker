import mongoose, { MongooseOptions } from "mongoose";
import { ILog } from "../interfaces/log";

interface IMongoConfig {
  uri: string;
}

/**
 * @class Database
 * @description This class is used to initialize the database
 */
export class MongoDatabase {
  private uri: string;
  private log: ILog;
  private service: string = "MongoDB";
  constructor(config: IMongoConfig, log: ILog) {
    this.uri = config.uri;
    this.log = log;
  }
  /**
   * @method init
   * @description This function is used to initialize the database
   * @returns void
   */
  public init(): void {
    mongoose.connect(this.uri);

    mongoose.connection.on("error", (err: any) => {
      this.log.error(
        this.service,
        new Error("MongoDB connection error: " + err),
      );
      process.exit();
    });
    mongoose.connection.on("connected", () => {
      this.log.info(this.service, "Connected to MongoDB");
    });
    mongoose.connection.on("disconnected", () => {
      this.log.info(this.service, "Disconnected from MongoDB");
    });
  }
}

export default MongoDatabase;

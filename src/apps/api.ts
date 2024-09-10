import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import http from "http";
import hpp from "hpp";
import helmet from "helmet";

import config from "../config";
import compression from "compression";
import { DepositsTracker } from "./tracker";

import { ILog } from "../interfaces/log";
import { IDepositTracker } from "../interfaces/depositTracker";
import { IDepositsRepository } from "../interfaces/repositories";
import { IEthProvider } from "../interfaces/ethProvider";
import { INotify } from "../interfaces/notify";

dotenv.config();

/**
 * @class Express
 * @description This class is used to initialize the express server
 */
export default class Express {
  public express: express.Application;
  private server: http.Server;
  private log: ILog;
  private service: string = "Express";
  private depositTracker: IDepositTracker | null;
  private depositRepo: IDepositsRepository;
  private notify: INotify;

  /**
   * @constructor
   * @description This function is used to initialize the express server
   * @returns void
   */
  constructor(
    log: ILog,
    depositRepo: IDepositsRepository,
    notify: INotify,
    ethProvider?: IEthProvider,
  ) {
    this.log = log;
    this.notify = notify;
    this.depositRepo = depositRepo;
    this.express = express();
    if (ethProvider) {
      let from: string[] = [];
      if (config.FROM_ADDRESS) {
        from = config.FROM_ADDRESS.split(",");
      }
      this.depositTracker = new DepositsTracker(
        this.notify,
        this.log,
        ethProvider,
        this.depositRepo,
        from,
      );
    }
    this.createServer();
    this.mountMiddlewares();
  }

  /**
   * @method init
   * @description This function is used to initialize the express server
   * @returns void
   */
  public init(): void {
    if (this.depositTracker) {
      this.depositTracker.startNewBlocksListener();
    }
    const port = config.PORT;
    // for 404 handler
    this.express.use((req, res) => {
      res.status(404).json({
        status: 404,
        message: "Not Found",
      });
    });

    this.server.listen(port, () => {
      this.log.info(this.service, `Server :: Running on port ${port}`);
    });
  }

  private mountMiddlewares(): void {
    const corsOptions: cors.CorsOptions = {
      origin: "*",
      optionsSuccessStatus: 200,
    };

    this.express.use(cors(corsOptions));

    this.express.use(helmet());
    this.express.use(hpp());
    this.express.use(compression());
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: true }));
  }

  private createServer(): void {
    this.server = http.createServer(this.express);
  }
}

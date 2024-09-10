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
import { Counter, Gauge, Registry } from "prom-client";

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
      let to: string[] = [];
      if (config.TO_ADDRESS) {
        to = config.TO_ADDRESS.split(",");
      }
      this.depositTracker = new DepositsTracker(
        this.notify,
        this.log,
        ethProvider,
        this.depositRepo,
        from,
        to,
      );
    }
    this.createServer();
    this.mountMiddlewares();
    this.mountRoutes();
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

  private mountRoutes(): void {
    const routes = new Routes(this.depositRepo);
    this.express.get("/metrics", routes.prometheusMetrics.bind(routes));
    this.express.get("/deposits", routes.getAllDataPaginated.bind(routes));
  }
}

class Routes {
  private depositRepo: IDepositsRepository;
  private registry: Registry;
  private totalDeposits: Counter;
  private latestBlockNumber: Gauge;
  private latestBlockTimestamp: Gauge;

  constructor(depositRepo: IDepositsRepository) {
    this.depositRepo = depositRepo;
    this.registry = new Registry();

    this.totalDeposits = new Counter({
      name: "total_deposits",
      help: "The total number of deposits",
      registers: [this.registry],
    });

    this.latestBlockNumber = new Gauge({
      name: "latest_block_number",
      help: "The latest block number",
      registers: [this.registry],
    });

    this.latestBlockTimestamp = new Gauge({
      name: "latest_block_timestamp",
      help: "The latest block timestamp",
      registers: [this.registry],
    });
  }

  // TODO: Utilize separate routes folder, can separate out logic for each route MVC style
  public async prometheusMetrics(req: express.Request, res: express.Response) {
    // current timestamp
    const fiveMinutesAgo = Math.floor((Date.now() - 5 * 60 * 1000) / 1000);

    try {
      const deposits = await this.depositRepo.getAll(fiveMinutesAgo);

      deposits.forEach((deposit) => {
        this.totalDeposits.inc();
        this.latestBlockNumber.set(deposit.blockNumber);
        this.latestBlockTimestamp.set(deposit.blockTimestamp);
      });

      res.set("Content-Type", this.registry.contentType);
      res.end(await this.registry.metrics());
    } catch (error) {
      res.status(500).json({ error: error, message: "Internal Server Error" });
    }
  }

  public async getAllDataPaginated(
    req: express.Request,
    res: express.Response,
  ) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    try {
      const deposits = await this.depositRepo.getAllPaginated(page, limit);
      res.status(200).json(deposits);
    } catch (error) {
      res.status(500).json({ error: error, message: "Internal Server Error" });
    }
  }
}

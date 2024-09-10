import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import http from "http";
import { ILog } from "../interfaces/log";
import config from "../config";
import compression from "compression";
import helmet from "helmet";
import hpp from "hpp";

dotenv.config();

/**
 * @class Express
 * @description This class is used to initialize the express server
 */
class Express {
  public express: express.Application;
  private server: http.Server;
  private log: ILog;
  private service: string = "Express";

  /**
   * @constructor
   * @description This function is used to initialize the express server
   * @returns void
   */
  constructor() {
    this.express = express();
    this.createServer();
    this.mountMiddlewares();
  }

  /**
   * @method init
   * @description This function is used to initialize the express server
   * @returns void
   */
  public init(): void {
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

export default new Express();

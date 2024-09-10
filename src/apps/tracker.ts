import { INotify } from "./../types/notify.d";
import { IDepositsRepository } from "../types/repositories";
import { IEthProvider } from "../types/ethProvider";
import { ILog } from "../types/log";
import { TransactionResponse } from "ethers";
import { Deposit, DepositSchema } from "../schemas/deposit";

export class DepositsTracker {
  private notifier: INotify;
  private depositRepo: IDepositsRepository;
  private ethProvider: IEthProvider;
  private service: string = "Deposits Tracker";
  private log: ILog;
  private from: string[] = [];

  constructor(
    notify: INotify,
    logger: ILog,
    ethProvider: IEthProvider,
    depositRepo: IDepositsRepository,
    from?: string[],
  ) {
    this.notifier = notify;
    this.ethProvider = ethProvider;
    this.depositRepo = depositRepo;
    this.log = logger;
    if (from) this.from = from;

    if (this.from.length) {
      this.log.info(
        this.service,
        `Starting Deposits Tracker for the following addresses: ${this.from.join(", ")}`,
      );
    }

    // Notify the user that the tracker has started
    this.notifier.notify(this.service, "Deposits Tracker started");
  }

  /**
   * @method startNewBlocksListener
   * @description This function is used to start listening for new blocks
   * @returns void
   */
  public startNewBlocksListener(): void {
    this.ethProvider.watchNewBlocks((blockNumber: number) => {
      this.processBlock(blockNumber);
    });
  }

  /**
   * @method processBlock
   * @description This function is used to process a block
   * @param blockNumber block number
   */
  // TODO: Implement Batch Processing
  public async processBlock(blockNumber: number): Promise<void> {
    try {
      const txns = await this.ethProvider.getBlockTransactions(blockNumber);

      let msg = `Processed block ${blockNumber} with ${txns.length} transactions`;
      for (const tx of txns) {
        if (this.from.length && !this.from.includes(tx.from)) {
          this.log.info(
            this.service,
            `Ignoring transaction ${tx.hash} from ${tx.from}`,
          );
          continue;
        }
        await this.saveTransaction(tx);
        msg += `\nSaved transaction ${tx.hash} from ${tx.from} with fee ${tx.gasPrice * tx.gasPrice}`;
      }

      this.notifier.notify(this.service, msg);
    } catch (err: any) {
      this.log.error(this.service + " [processBlock]", err.message);
      await this.notifier.notify(
        this.service,
        "Error processing block " + blockNumber,
      );
    }
  }

  /**
   * @method saveTransaction
   * @description This function is used to save a transaction to the database and notify the user
   * @param tx the transaction to be saved
   * @returns void
   */
  private async saveTransaction(tx: TransactionResponse): Promise<void> {
    try {
      const block = await this.ethProvider.getBlock(tx.blockNumber);

      const depositRecord: Deposit = {
        blockNumber: tx.blockNumber,
        blockTimestamp: block.timestamp,
        pubkey: tx.from,
        hash: tx.hash,
        fee: tx.gasPrice * tx.gasPrice,
      };
      DepositSchema.parse(depositRecord);

      await this.depositRepo.create(depositRecord);
    } catch (err: any) {
      throw new Error("[saveTransaction] " + err.message);
    }
  }
}

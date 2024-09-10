import { INotify } from "../interfaces/notify.d";
import { IDepositsRepository } from "../interfaces/repositories";
import { IDepositTracker } from "../interfaces/depositTracker";
import { IEthProvider } from "../interfaces/ethProvider";
import { ILog } from "../interfaces/log";
import { TransactionResponse, Block } from "ethers";
import { Deposit, DepositSchema } from "../schemas/deposit";

export class DepositsTracker implements IDepositTracker {
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
      this.log.debug(
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
    this.ethProvider.watchNewBlocks(async (blockNumber: number) => {
      try {
        await this.processBlock(blockNumber);
      } catch (error) {
        this.log.error(
          this.service + "[startNewBlocksListener]",
          new Error(`Error processing block ${blockNumber}: ${error.message}`),
        );
      }
    });
  }

  /**
   * @method processBlock
   * @description This function is used to process a block
   * @param blockNumber block number
   */
  public async processBlock(blockNumber: number): Promise<void> {
    try {
      const txns = await this.ethProvider.getBlockTransactions(blockNumber);
      const block = await this.ethProvider.getBlock(blockNumber);
      const batchSize = 10;
      const batch = [];
      for (const tx of txns) {
        if (this.from.length && !this.from.includes(tx.from)) {
          this.log.info(
            this.service,
            `Ignoring transaction ${tx.hash} from ${tx.from}`,
          );
          continue;
        }

        batch.push(tx);
        if (batch.length >= batchSize) {
          await this.processBatch(batch, block);
          batch.length = 0; // Clear the batch
        }
      }

      // Process any remaining transactions in the last batch
      if (batch.length > 0) {
        await this.processBatch(batch, block);
      }
    } catch (err: any) {
      this.log.error(this.service + " [processBlock]", err.message);
      await this.notifier.notify(
        this.service,
        "Error processing block " + blockNumber,
      );
    }
  }

  private async processBatch(
    batch: TransactionResponse[],
    block: Block,
  ): Promise<void> {
    let msg = `Processing batch of ${batch.length} transactions`;
    this.log.debug(this.service, msg);
    const transactionsSavePromises = [];

    for (const tx of batch) {
      const log = `\nSuccessfully processed transaction ${tx.hash} from ${tx.from} with fee ${tx.gasPrice * tx.gasPrice}`;
      transactionsSavePromises.push(this.saveTransaction(tx, block));
      msg += log;
      this.log.debug(this.service, log);
    }

    await Promise.all(transactionsSavePromises);

    await Promise.all([this.notifier.notify(this.service, msg)]);
  }

  /**
   * @method saveTransaction
   * @description This function is used to save a transaction to the database and notify the user
   * @param tx the transaction to be saved
   * @returns void
   */
  private async saveTransaction(
    tx: TransactionResponse,
    block: Block,
  ): Promise<void> {
    try {
      const depositRecord: Deposit = {
        blockNumber: tx.blockNumber,
        blockTimestamp: block.timestamp,
        pubkey: tx.from,
        hash: tx.hash,
        fee: tx.gasPrice * tx.gasPrice,
      };
      DepositSchema.parse(depositRecord);
      this.log.debug(
        this.service,
        `Saving transaction ${tx.hash} to the database`,
      );

      await this.depositRepo.create(depositRecord);
    } catch (err: any) {
      throw new Error("[saveTransaction] " + err.message);
    }
  }
}

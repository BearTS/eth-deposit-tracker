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
  private to: string[] = [];

  constructor(
    notify: INotify,
    logger: ILog,
    ethProvider: IEthProvider,
    depositRepo: IDepositsRepository,
    from?: string[],
    to?: string[],
  ) {
    this.notifier = notify;
    this.ethProvider = ethProvider;
    this.depositRepo = depositRepo;
    this.log = logger;
    if (from) this.from = from;
    if (to) this.to = to;

    if (this.from.length) {
      this.log.info(
        this.service,
        `Starting Deposits Tracker for the following addresses: ${this.from.join(", ")}`,
      );
    }
    if (this.to.length) {
      this.log.info(
        this.service,
        `Starting Deposits Tracker for the following addresses: ${this.to.join(", ")}`,
      );
    }

    // Notify the user that the tracker has started
    this.notifier.notify(this.service, "Deposits Tracker started");
  }

  /**
   * @method startNewListener
   * @description This function is used to start listening for new contracts
   * @returns void
   */
  public startNewListener(): void {
    this.ethProvider.watchContractEvents(
      async (
        pubkey: any,
        withdrawal_credentials: any,
        amount: any,
        signature: any,
        index: any,
        event: any,
      ) => {
        try {
          // await this.processBlock(blockNumber);
          this.log.info(
            this.service,
            `Processing event ${event} from ${pubkey} with amount ${amount} withdrawal_credentials ${withdrawal_credentials} signature ${signature} index ${index}`,
          );
          const blockNumber = await this.ethProvider
            .getProvider()
            .getBlockNumber();
          await this.processBlock(blockNumber);
        } catch (error) {
          this.log.error(
            this.service + "[startNewListener]",
            new Error(`Error processing contract: ${error.message}`),
          );
        }
      },
    );
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
          this.log.debug(
            this.service,
            `Ignoring transaction ${tx.hash} from ${tx.from}`,
          );
          continue;
        }

        if (this.to.length && !this.to.includes(tx.to)) {
          this.log.debug(
            this.service,
            `Ignoring transaction ${tx.hash} to ${tx.to}`,
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
      this.log.info(this.service, `Saving transaction ${tx} to the database`);
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

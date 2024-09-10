import { ethers, TransactionResponse } from "ethers";
import { ILog } from "../interfaces/log";

/**
 * @interface IEthereumConfig
 * @description This interface defines the configuration for Ethereum
 */
interface IEthereumConfig {
  rpcUrl: string;
  contractAddress: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface QueueItem<T> {
  callback: () => Promise<T>;
  resolvePromise: (value: T | PromiseLike<T>) => void;
}

/**
 * @class EthereumProvider
 * @description This class is used to interact with Ethereum
 * @returns an instance of EthereumProvider
 */
export class EthereumProvider {
  private provider: ethers.JsonRpcProvider;
  private log: ILog;
  private service = "EthereumProvider";
  private queue: QueueItem<any>[] = [];
  private isQueueProcessing = false;
  private maxRetries = 10;
  private batchSize = 10;
  private contract: ethers.Contract;
  private contractAddress: string;

  constructor(config: IEthereumConfig, log: ILog) {
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.log = log;
    this.contractAddress = config.contractAddress;

    const depositABI = [
      "event DepositEvent(bytes pubkey, bytes withdrawal_credentials, bytes amount, bytes signature, bytes index)",
    ];

    if (this.contractAddress) {
      this.contract = new ethers.Contract(
        this.contractAddress,
        depositABI,
        this.provider,
      );
    }
  }

  /**
   * @method getTransaction
   * @description This function is used to get a transaction
   * @param txHash transaction hash
   * @returns ethers.TransactionResponse
   */
  public getTransaction(
    txHash: string,
  ): Promise<ethers.TransactionResponse | null> {
    return this.enqueueCallback(() => this.provider.getTransaction(txHash));
  }

  public getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  /**
   * @method getBlock
   * @description This function is used to get a block
   * @param blockNumber block number
   * @returns ethers.Block
   */
  public getBlock(blockNumber: number): Promise<ethers.Block | null> {
    return this.enqueueCallback(() => this.provider.getBlock(blockNumber));
  }

  /**
   * @method getBlockNumber
   * @description This function is used to get the block number
   * @returns block number
   */
  public async getBlockNumber(): Promise<number> {
    return this.provider.getBlockNumber();
  }

  /**
   * @method getBlockTransactions
   * @description Fetch all transactions in a block by its number
   * @param blockNumber block number
   * @returns array of TransactionResponse or null
   */
  public async getBlockTransactions(
    blockNumber: number,
  ): Promise<TransactionResponse[] | null> {
    const txns: TransactionResponse[] = [];
    const block = await this.getBlock(blockNumber);

    if (!block || !block.transactions.length) {
      this.log.debug(
        this.service,
        `No transactions found in block ${blockNumber}`,
      );
      return null;
    }

    this.log.debug(
      this.service,
      `Processing block ${blockNumber} with ${block.transactions.length} transactions`,
    );

    await Promise.all(
      block.transactions.map(async (txHash: string) => {
        const tx = await this.getTransaction(txHash);
        if (tx) txns.push(tx);
      }),
    );

    return txns.length ? txns : null;
  }

  /**
   * @method watchNewBlocks
   * @description Subscribes to new blocks and triggers the callback
   * @param callback function triggered on new block
   */
  public watchNewBlocks(callback: (blockNumber: number) => void): void {
    this.provider.on("block", callback);
  }

  public watchContractEvents(
    callback: (
      pubkey: any,
      withdrawal_credentials: any,
      amount: any,
      signature: any,
      index: any,
      event: any,
    ) => void,
  ): void {
    this.contract.on("DepositEvent", callback);
  }

  /**
   * @method enqueueCallback
   * @description Adds a callback to the queue for processing
   * @param callback the function to enqueue
   * @returns a promise with the result of the callback
   */
  private enqueueCallback<T>(callback: () => Promise<T>): Promise<T> {
    return new Promise((resolve) => {
      this.queue.push({ callback, resolvePromise: resolve });
      this.processQueue();
    });
  }

  /**
   * @method processQueue
   * @description Processes the queued callbacks in batches
   */
  private async processQueue(): Promise<void> {
    if (this.isQueueProcessing || !this.queue.length) return;

    this.isQueueProcessing = true;
    const batch = this.queue.splice(0, this.batchSize);

    try {
      await Promise.all(
        batch.map(async ({ callback, resolvePromise }) => {
          const result = await this.executeWithRetry(callback);
          resolvePromise(result);
        }),
      );
      this.log.debug(
        this.service,
        `Processed ${batch.length} batched requests`,
      );
    } catch (error: any) {
      this.log.error(
        this.service,
        new Error(`Error processing queue: ${error.message}`),
      );
    } finally {
      this.isQueueProcessing = false;
      if (this.queue.length) this.processQueue();
    }
  }

  /**
   * @method executeWithRetry
   * @description Executes a callback with retry logic for rate limiting
   * @param callback function to execute
   * @param retries current retry attempt (default: this.maxRetries)
   * @param backoff initial backoff time in ms (default: 1000ms)
   * @returns result of the callback or null
   */
  private async executeWithRetry<T>(
    callback: () => Promise<T>,
    retries: number = this.maxRetries,
    backoff: number = 1000,
  ): Promise<T | null> {
    try {
      return await callback();
    } catch (error: any) {
      if (retries > 0 && error?.code === 429) {
        this.log.info(
          this.service,
          `Rate limit error. Retrying in ${backoff}ms...`,
        );
        await sleep(backoff);
        return this.executeWithRetry(callback, retries - 1, backoff * 2);
      }
      this.log.error(
        this.service,
        new Error(`Failed to execute callback: ${error.message}`),
      );
      throw error;
    }
  }
}

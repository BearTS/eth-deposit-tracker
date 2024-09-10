import { ethers, TransactionResponse } from "ethers";
import { ILog } from "../interfaces/log";

/**
 * @interface IEthereumConfig
 * @description This interface is used to define the configuration for Ethereum
 */
interface IEthereumConfig {
  rpcUrl: string;
}

/**
 * @class EthereumProvider
 * @description This class is used to interact with Ethereum
 * @returns an instance of EthereumProvider
 */
export class EthereumProvider {
  private provider: ethers.JsonRpcProvider;
  private log: ILog;
  private service: string = "Ethereum Provider";

  constructor(config: IEthereumConfig, log: ILog) {
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.log = log;
  }

  /**
   * @method getTransaction
   * @description This function is used to get a transaction
   * @param txHash transaction hash
   * @returns ethers.TransactionResponse
   */
  public async getTransaction(
    txHash: string,
  ): Promise<ethers.TransactionResponse | null> {
    return await this.provider.getTransaction(txHash);
  }

  /**
   * @method getBlock
   * @description This function is used to get a block
   * @param blockNumber block number
   * @returns ethers.Block
   */
  public async getBlock(blockNumber: number): Promise<ethers.Block | null> {
    return await this.provider.getBlock(blockNumber);
  }

  /**
   *
   * @method getBlockNumber
   * @description This function is used to get the block number
   * @returns block number
   */
  public async getBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  public async getBlockTransactions(
    blockNumber: number,
  ): Promise<TransactionResponse[] | null> {
    const txns: TransactionResponse[] = [];
    const block = await this.provider.getBlock(blockNumber);

    if (!block) {
      this.log.info(this.service, "Block not found");
      return;
    }

    this.log.info(
      this.service,
      `Processing block ${blockNumber} with ${block.transactions.length} transactions`,
    );
    for (const txnHash of block.transactions) {
      const tx = await this.provider.getTransaction(txnHash);
      // TODO: Can utilize a queue here to process transactions in parallel
      if (tx) {
        txns.push(tx);
      }

      // if (txns.length > 10) {
      //  break;
      // }
    }

    return txns.length > 0 ? txns : null;
  }

  public async watchNewBlocks(
    callback: (blockNumber: number) => void,
  ): Promise<void> {
    this.provider.on("block", async (blockNumber) => {
      callback(blockNumber);
    });
  }
}

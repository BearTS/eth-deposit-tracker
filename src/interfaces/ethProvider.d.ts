import { ethers } from "ethers";

export interface IEthProvider {
  getTransaction(txHash: string): Promise<ethers.TransactionResponse | null>;
  getBlock(blockNumber: number): Promise<ethers.Block | null>;
  getBlockNumber(): Promise<number>;
  getBlockTransactions(
    blockNumberOrHash: string | number,
  ): Promise<ethers.TransactionResponse[] | null>;

  watchNewBlocks(callback: (blockNumber: number) => void): void;
  watchContractEvents(
    callback: (
      pubkey: any,
      withdrawal_credentials: any,
      amount: any,
      signature: any,
      index: any,
      event: any,
    ) => void,
  ): void;

  getProvider(): ethers.JsonRpcProvider;
}

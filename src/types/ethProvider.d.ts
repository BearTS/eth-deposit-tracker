import { ethers } from "ethers";

export interface IEthProvider {
    getTransaction(txHash: string): Promise<ethers.TransactionResponse | null> ;
    getBlock(blockNumber: number): Promise<ethers.Block | null>;
    getBlockNumber(): Promise<number>;
}
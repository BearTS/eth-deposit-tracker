export interface IEthProvider {
    getTransaction(txHash: string): Promise<any>;
    getBlock(blockNumber: number): Promise<any>;
}
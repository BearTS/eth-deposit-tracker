import { ethers } from "ethers";

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

    constructor(config: IEthereumConfig) {
        this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    }

    /**
     * @method getTransaction
     * @description This function is used to get a transaction
     * @param txHash transaction hash
     * @returns ethers.TransactionResponse
     */
    public async getTransaction(txHash: string): Promise<ethers.TransactionResponse | null>  {
        return await this.provider.getTransaction(txHash);
    }

    /**
     * @method getBlock
     * @description This function is used to get a block
     * @param blockNumber block number
     * @returns ethers.Block
     */
    public async getBlock(blockNumber: number): Promise<ethers.Block | null>  {
        return await this.provider.getBlock(blockNumber);
    }

    public async getBlockNumber(): Promise<number> {
        return await this.provider.getBlockNumber();
    }
}
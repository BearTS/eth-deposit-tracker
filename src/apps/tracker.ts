import { INotify } from './../types/notify.d';
import { IDepositsRepository } from '../types/repositories';
import { IEthProvider } from '../types/ethProvider';
import { ILog } from '../types/log';


export class DepositsTracker {
    private notifier: INotify;
    private depositRepo: IDepositsRepository;
    private ethProvider: IEthProvider;
    private service: string = "Deposits Tracker";
    private log: ILog;
    
    constructor(notify: INotify, logger: ILog, ethProvider: IEthProvider, depositRepo?: IDepositsRepository) {
        this.notifier = notify;
        this.ethProvider = ethProvider;
        this.depositRepo = depositRepo;
        this.log = logger;

        this.notifier.notify("Deposits Tracker started", this.service);
    }

    public async trackBlockTransactions(blockNumber: number): Promise<void> {
        const deposit = await this.depositRepo.getLastStoredDeposit()
        const lastStoredBlock = deposit ? deposit.blockNumber : blockNumber;
        this.log.info(this.service, `Last stored block: ${lastStoredBlock}`);

        let latestBlock = await this.ethProvider.getBlockNumber();

        for (let i = lastStoredBlock; i <= latestBlock; i++) {
            const block = await this.ethProvider.getBlock(i);
            this.log.info(this.service, `Processing block: ${block.baseFeePerGas}`);
        }
    }
}
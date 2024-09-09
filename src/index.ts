import { EthereumProvider } from "./providers/ethProvider";
import config from "./config";

const txHash = "0x1ecad2874a871dd3ec8e58e653a8cf4a396c4f7f14e3f700acc710cacda83b7e"

const ethProvider = new EthereumProvider({ rpcUrl: config.RPC_URL });

ethProvider.getTransaction(txHash).then((tx) => {
    console.log(tx);
});
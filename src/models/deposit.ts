import { type Deposit } from "../schemas/deposit";
import mongoose, {Schema, Document} from "mongoose";

// Mongoose Interface for Deposit
export interface IDeposit extends Deposit, Document {}

const DepositSchema: Schema = new Schema({
    blockNumber: { type: Number, required: true },
    blockTimestamp: { type: Number, required: true },
    fee: { type: String, required: false },
    hash: { type: String, required: false },
    pubkey: { type: String, required: true }
});

export const DepositModel = mongoose.model<IDeposit>("Deposit", DepositSchema);
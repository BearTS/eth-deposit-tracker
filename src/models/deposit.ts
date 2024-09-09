import { type Deposit } from "../schemas/deposit";
import mongoose, {Schema, Document} from "mongoose";

// Mongoose Interface for Deposit
export interface IDeposit extends Deposit, Document {}

const DepositSchema: Schema = new Schema({
    blockNumber: { type: Number, required: true },
    blockTimestamp: { type: Number, required: true },
    fee: { type: String, required: false },
    hash: { type: String, required: false, unique: true },
    pubkey: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

export const DepositModel = mongoose.model<Deposit>("Deposit", DepositSchema);
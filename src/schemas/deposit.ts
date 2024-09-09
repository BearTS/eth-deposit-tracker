import { z } from "zod";

/**
 * @typedef {Object} Deposit
 * @property {number} blockNumber
 * @property {number} blockTimestamp
 * @property {bigint} fee
 * @property {string} hash
 * @property {string} pubkey
 * @description Deposit Schema
 */
export const DepositSchema = z.object({
    blockNumber: z.number(),
    blockTimestamp: z.number(),
    fee: z.bigint().optional(),
    hash: z.string().optional(),
    pubkey: z.string()
});
    
// Deposit type
export type Deposit = z.infer<typeof DepositSchema>;

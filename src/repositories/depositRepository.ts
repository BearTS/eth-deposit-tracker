import { Deposit } from "../schemas/deposit";
import { IDepositsRepository } from "../types/repositories";
import { Model } from "mongoose";
import log from "../providers/logger";

// https://www.mongodb.com/docs/manual/reference/error-codes/#mongodb-error-11000
const DuplicateErrorCode = 11000;

/**
 * @class DepositRepository
 * @description This class is used to interact with the Deposit collection in the database
 * @implements IDepositsRepository
 * @param model - The Mongoose model for the Deposit collection
 */
export class DepositRepository implements IDepositsRepository {
    private model: Model<Deposit>;

    constructor(model: Model<Deposit>) {
        this.model = model;
    }

    /**
     * @method create
     * @description This function is used to create a new deposit record
     * @param data
     * @returns 
     */
    public async create(data: Deposit): Promise<Deposit> {
        try {
            const newRecord = new this.model({
                id: data.hash,
                ...data
            });
            return await newRecord.save();
        } catch (error) {
            if (error.code === DuplicateErrorCode) {
                log.error(`Duplicate key error: ${error.keyValue}`);
                throw new Error("Duplicate key error");
            }
            log.error(error);
            throw new Error(error);
        }
    }

    /**
     * @method findById
     * @description This function is used to find a deposit record by its ID
     * @param id 
     * @returns 
     */
    public async findById(id: string): Promise<Deposit | null> {
        return this.model.findById(id).exec();
    }

    public async getAll(): Promise<Deposit[]> { 
        const deposits = await this.model.find().exec();
        return deposits;
    }
}
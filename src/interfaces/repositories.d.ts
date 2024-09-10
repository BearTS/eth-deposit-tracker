import { Deposit } from "../schemas/deposit";

export interface IDepositsRepository {
  create(data: Deposit): Promise<Deposit>;
  findById(id: string): Promise<Deposit | null>;
  getAll(): Promise<Deposit[]>;
  getLastStoredDeposit(): Promise<Deposit | null>;
}

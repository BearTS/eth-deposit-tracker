export interface ILog {
    info(message: string): void;
    error(err: Error): void;
}

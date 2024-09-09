export interface ILog {
    info(message: string): void;
    error(err: Error): void;
}

export interface INotify {
    notify(message: string): Promise<void>;
}
export interface INotify {
    notify(message: string): Promise<void>;
}
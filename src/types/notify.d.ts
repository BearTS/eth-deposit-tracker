export interface INotify {
    notify(message: string, service: string): Promise<void>;
}
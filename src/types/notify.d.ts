export interface INotify {
  notify(service: string, message: string): Promise<void>;
}

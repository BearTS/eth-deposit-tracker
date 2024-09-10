export interface ILog {
  info(service: string, message: string): void;
  error(service: string, err: Error): void;
  debug(service: string, message: string): void;
}

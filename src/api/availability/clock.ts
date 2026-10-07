export abstract class Clock {
  abstract now(): number;
  abstract sleep(milliseconds: number, signal: AbortSignal): Promise<void>;
}

import { Clock } from "./clock";

export class SystemClock extends Clock {
  now(): number {
    return Date.now();
  }

  sleep(milliseconds: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve) => {
      if (signal.aborted) {
        resolve();
        return;
      }
      const timer = setTimeout(finish, milliseconds);
      function finish() {
        clearTimeout(timer);
        signal.removeEventListener("abort", finish);
        resolve();
      }
      signal.addEventListener("abort", finish, { once: true });
    });
  }
}

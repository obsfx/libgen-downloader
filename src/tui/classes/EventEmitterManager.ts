import EventEmitter from "events";

export enum AppEvent {
  SEARCH = "search",
  BACK_TO_SEARCH = "backToSearch",
  NEXT_PAGE = "nextPage",
  PREV_PAGE = "prevPage",
  START_BULK_DOWNLOAD = "startBulkDownload",
  THROW_ERROR = "throwError",
  EXIT = "exit",
}

export abstract class EventManager {
  private static eventEmitter: EventEmitter = new EventEmitter();

  public static on(event: AppEvent, listener: (...args: unknown[]) => void) {
    this.eventEmitter.removeAllListeners(event);
    this.eventEmitter.on(event, listener);
  }

  public static emit(event: AppEvent, ...args: unknown[]) {
    this.eventEmitter.emit(event, ...args);
  }
}

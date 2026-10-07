export enum Option {
  SEARCH = "search_option",
  NEXT_PAGE = "next_page_option",
  PREV_PAGE = "prev_page_option",
  START_BULK_DOWNLOAD = "start_bulk_download_option",
  EXIT = "exit_option",
}

export enum ResultListEntryOption {
  SEE_DETAILS,
  DOWNLOAD_DIRECTLY,
  BULK_DOWNLOAD_QUEUE,
  TURN_BACK_TO_THE_LIST,
}

export enum DetailEntryOption {
  TURN_BACK_TO_THE_LIST,
  DOWNLOAD_DIRECTLY,
  BULK_DOWNLOAD_QUEUE,
}

export enum BulkDownloadAfterCompleteOption {
  RETRY_FAILED_DOWNLOADS,
  TURN_BACK_TO_THE_LIST,
  BACK_TO_SEARCH,
}

export enum ErrorMessageOption {
  RETRY,
  EXIT,
}

export enum BeforeExitOption {
  YES,
  NO,
}

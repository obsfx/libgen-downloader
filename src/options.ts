export enum Option {
  SEARCH = "search_option",
  NEXT_PAGE = "next_page_option",
  PREV_PAGE = "prev_page_option",
  START_BULK_DOWNLOAD = "start_bulk_download_option",
  EXIT = "exit_option",
  SEE_DETAILS = "see_details_option",
  ALTERNATIVE_DOWNLOADS = "alternative_downloads",
  DOWNLOAD_DIRECTLY = "download_directly_option",
  ADD_TO_BULK_DOWNLOAD_QUEUE = "add_to_bulk_download_queue_option",
  REMOVE_FROM_BULK_DOWNLOAD_QUEUE = "remove_from_bulk_download_queue_option",
  TURN_BACK_TO_THE_LIST = "turn_back_to_the_list_option",
  BACK_TO_ENTRY_OPTIONS = "back_to_entry_options",
}

export enum ResultListEntryOption {
  SEE_DETAILS,
  ALTERNATIVE_DOWNLOADS,
  DOWNLOAD_DIRECTLY,
  BULK_DOWNLOAD_QUEUE,
  TURN_BACK_TO_THE_LIST,
  BACK_TO_ENTRY_OPTIONS,
}

export enum DetailEntryOption {
  TURN_BACK_TO_THE_LIST,
  DOWNLOAD_DIRECTLY,
  ALTERNATIVE_DOWNLOADS,
  BULK_DOWNLOAD_QUEUE,
  BACK_TO_ENTRY_OPTIONS,
}

export enum BulkDownloadAfterCompleteOption {
  TURN_BACK_TO_THE_LIST,
  BACK_TO_SEARCH,
}

export enum ErrorMessageOption {
  EXIT,
}

export enum BeforeExitOption {
  YES,
  NO,
}

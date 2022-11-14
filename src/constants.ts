export const SEARCH_LAYOUT = "search";
export const RESULT_LIST_LAYOUT = "result_list_layout";
export const DETAIL_LAYOUT = "detail_layout";

export const OPTION_SEARCH_ID = "search_option";
export const OPTION_SEARCH_LABEL = "? Search";
export const OPTION_NEXT_PAGE_ID = "next_page_option";
export const OPTION_NEXT_PAGE_LABEL = "→ Next Page";
export const OPTION_PREV_PAGE_ID = "prev_page_option";
export const OPTION_PREV_PAGE_LABEL = "← Prev Page";
export const OPTION_START_BULK_DOWNLOAD_ID = "start_bulk_download_option";
export const OPTION_START_BULK_DOWNLOAD_LABEL = "@ Start Bulk Download";
export const OPTION_EXIT_ID = "exit_option";
export const OPTION_EXIT_LABEL = "✖ Exit";

export const OPTION_SEE_DETAILS_ID = "see_details_option";
export const OPTION_SEE_DETAILS_LABEL = "See Details";
export const OPTION_ALTERNATIVE_DOWNLOADS_ID = "alternative_downloads";
export const OPTION_ALTERNATIVE_DOWNLOADS_LABEL = "Alternative Downloads";
export const OPTION_DOWNLOAD_DIRECTLY_ID = "download_directly_option";
export const OPTION_DOWNLOAD_DIRECTLY_LABEL = "Download Directly";
export const OPTION_ADD_TO_BULK_DOWNLOAD_QUEUE_ID = "add_to_bulk_download_queue_option";
export const OPTION_ADD_TO_BULK_DOWNLOAD_QUEUE_LABEL = "Add To Bulk Download Queue";
export const OPTION_TURN_BACK_TO_THE_LIST_ID = "turn_back_to_the_list_option";
export const OPTION_TURN_BACK_TO_THE_LIST_LABEL = "Turn Back To The List";
export const OPTION_BACK_TO_ENTRY_OPTIONS_ID = "back_to_entry_options";
export const OPTION_BACK_TO_ENTRY_OPTIONS_LABEL = "Back";

export const ListEntryOptions = {
  SEE_DETAILS: { id: OPTION_SEE_DETAILS_ID, label: OPTION_SEE_DETAILS_LABEL },
  ALTERNATIVE_DOWNLOADS: {
    id: OPTION_ALTERNATIVE_DOWNLOADS_ID,
    label: OPTION_ALTERNATIVE_DOWNLOADS_LABEL,
  },
  DOWNLOAD_DIRECTLY: {
    id: OPTION_DOWNLOAD_DIRECTLY_ID,
    label: OPTION_DOWNLOAD_DIRECTLY_LABEL,
  },
  ADD_TO_BULK_DOWNLOAD_QUEUE: {
    id: OPTION_ADD_TO_BULK_DOWNLOAD_QUEUE_ID,
    label: OPTION_ADD_TO_BULK_DOWNLOAD_QUEUE_LABEL,
  },
  TURN_BACK_TO_THE_LIST: {
    id: OPTION_TURN_BACK_TO_THE_LIST_ID,
    label: OPTION_TURN_BACK_TO_THE_LIST_LABEL,
  },
  BACK_TO_ENTRY_OPTIONS: {
    id: OPTION_BACK_TO_ENTRY_OPTIONS_ID,
    label: OPTION_BACK_TO_ENTRY_OPTIONS_LABEL,
  },
};

export const DetailOptions = {
  TURN_BACK_TO_THE_LIST: {
    id: OPTION_TURN_BACK_TO_THE_LIST_ID,
    label: OPTION_TURN_BACK_TO_THE_LIST_LABEL,
  },
  DOWNLOAD_DIRECTLY: {
    id: OPTION_DOWNLOAD_DIRECTLY_ID,
    label: OPTION_DOWNLOAD_DIRECTLY_LABEL,
  },
  ALTERNATIVE_DOWNLOADS: {
    id: OPTION_ALTERNATIVE_DOWNLOADS_ID,
    label: OPTION_ALTERNATIVE_DOWNLOADS_LABEL,
  },
  ADD_TO_BULK_DOWNLOAD_QUEUE: {
    id: OPTION_ADD_TO_BULK_DOWNLOAD_QUEUE_ID,
    label: OPTION_ADD_TO_BULK_DOWNLOAD_QUEUE_LABEL,
  },
};

export const FETCHING_CONFIG = "Fetching configuration file...";
export const FINDING_MIRROR = "Finding an available mirror...";
export const COULDNT_REACH_TO_CONF = "Couldn't reach to configuration";
export const COULDNT_REACH_TO_MIRROR = "Couldn't reach to mirror";
export const GETTING_RESULTS = "Getting results...";
export const ERR_OCCURED_WHILE_PARSING_DOC = "Error occured while parsing the document";

export const SEARCH_MIN_CHAR = 3;
export const RESULT_LIST_LENGTH = 12;
export const RESULT_LIST_ACTIVE_LIST_INDEX = 3;

export const TABLE_CONTAINER_SELECTOR = ".c tbody";
export const MAIN_DOWNLOAD_URL_SELECTOR = "#info #download h2 a";
export const OTHER_DOWNLOAD_URLS_SELECTOR = "#info #download ul";

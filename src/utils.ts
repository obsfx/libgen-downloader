import { Entry } from "./api/models/Entry";
import { ListItem, ResultListItemType } from "./api/models/ListItem";
import {
  MIN_RESULT_LIST_LENGTH,
  OPTION_EXIT_ID,
  OPTION_EXIT_LABEL,
  OPTION_NEXT_PAGE_ID,
  OPTION_NEXT_PAGE_LABEL,
  OPTION_PREV_PAGE_ID,
  OPTION_PREV_PAGE_LABEL,
  OPTION_SEARCH_ID,
  OPTION_SEARCH_LABEL,
  OPTION_START_BULK_DOWNLOAD_ID,
  OPTION_START_BULK_DOWNLOAD_LABEL,
  RESULT_LIST_ACTIVE_LIST_INDEX,
  RESULT_LIST_LENGTH,
} from "./constants";
import { FAIL_REQ_ATTEMPT_COUNT, FAIL_REQ_ATTEMPT_DELAY_MS } from "./settings";

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

export async function attempt<T>(
  cb: () => Promise<T>,
  onFail: (message: string) => void,
  onError: (message: string) => void,
  onComplete?: () => void
): Promise<T | null> {
  for (let i = 0; i < FAIL_REQ_ATTEMPT_COUNT; i++) {
    try {
      const result = await cb();

      if (onComplete) {
        onComplete();
      }

      return result;
    } catch (e: unknown) {
      onFail(`Request failed, trying again ${i + 1}/${FAIL_REQ_ATTEMPT_COUNT}`);
      await delay(FAIL_REQ_ATTEMPT_DELAY_MS);
      if (i + 1 === FAIL_REQ_ATTEMPT_COUNT) {
        onError((e as Error)?.message);
      }
    }
  }
  return null;
}

export const createOptionItem = (id: string, label: string, onSelect: () => void): ListItem => ({
  type: ResultListItemType.Option,
  data: {
    id,
    label,
    onSelect,
  },
});

interface constructInitialListItemsArgs {
  entries: Entry[];
  currentPage: number;
  nextPageEntries: Entry[];
  handleSearchOption: () => void;
  handleNextPageOption: () => void;
  handlePrevPageOption: () => void;
  handleStartBulkDownloadOption: () => void;
  handleExitOption: () => void;
}

export const constructListItems = ({
  entries,
  currentPage,
  nextPageEntries,
  handleSearchOption,
  handleNextPageOption,
  handlePrevPageOption,
  handleStartBulkDownloadOption,
  handleExitOption,
}: constructInitialListItemsArgs) => {
  const entryListItems: ListItem[] = entries.map<ListItem>((entry, idx) => ({
    type: ResultListItemType.Entry,
    data: entry,
    order: idx + 1,
  }));

  return [
    ...entryListItems.slice(
      entryListItems.length - RESULT_LIST_ACTIVE_LIST_INDEX,
      entryListItems.length
    ),
    createOptionItem(OPTION_SEARCH_ID, OPTION_SEARCH_LABEL, handleSearchOption),
    ...(nextPageEntries.length > 0
      ? [createOptionItem(OPTION_NEXT_PAGE_ID, OPTION_NEXT_PAGE_LABEL, handleNextPageOption)]
      : []),
    ...(currentPage > 1
      ? [createOptionItem(OPTION_PREV_PAGE_ID, OPTION_PREV_PAGE_LABEL, handlePrevPageOption)]
      : []),
    createOptionItem(
      OPTION_START_BULK_DOWNLOAD_ID,
      OPTION_START_BULK_DOWNLOAD_LABEL,
      handleStartBulkDownloadOption
    ),
    createOptionItem(OPTION_EXIT_ID, OPTION_EXIT_LABEL, handleExitOption),
    ...entryListItems.slice(0, entryListItems.length - RESULT_LIST_ACTIVE_LIST_INDEX),
  ];
};

export const getRenderedListItems = (
  listItems: ListItem[],
  anyEntryExpanded: boolean,
  activeExpandedListLength: number
) => {
  const renderedItemsLimit = Math.max(
    MIN_RESULT_LIST_LENGTH,
    anyEntryExpanded ? RESULT_LIST_LENGTH - activeExpandedListLength : RESULT_LIST_LENGTH
  );
  const renderedItems = listItems.slice(0, renderedItemsLimit);

  return renderedItems;
};

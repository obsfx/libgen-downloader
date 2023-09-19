import { Entry } from "./api/models/Entry.js";
import { ListItem, IResultListItemType } from "./api/models/ListItem.js";
import {
  MIN_RESULT_LIST_LENGTH,
  RESULT_LIST_ACTIVE_LIST_INDEX,
  RESULT_LIST_LENGTH,
} from "./constants.js";
import { Option } from "./options.js";
import Label from "./labels.js";
import { FAIL_REQ_ATTEMPT_COUNT, FAIL_REQ_ATTEMPT_DELAY_MS } from "./settings.js";

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

export async function attempt<T>(
  cb: () => Promise<T>,
  onFail?: (message: string) => void,
  onError?: (message: string) => void,
  onComplete?: () => void
): Promise<T | null> {
  for (let i = 0; i < FAIL_REQ_ATTEMPT_COUNT; i++) {
    try {
      const result = await cb();
      console.log("attempt success", result);

      if (onComplete) {
        onComplete();
      }

      return result;
    } catch (e: unknown) {
      if (onFail) {
        onFail(`Request failed, trying again ${i + 1}/${FAIL_REQ_ATTEMPT_COUNT}`);
      }
      await delay(FAIL_REQ_ATTEMPT_DELAY_MS);
      if (i + 1 === FAIL_REQ_ATTEMPT_COUNT) {
        if (onError) {
          onError((e as Error)?.message);
        }
      }
    }
  }
  return null;
}

export const createOptionItem = (id: string, label: string, onSelect: () => void): ListItem => ({
  type: IResultListItemType.Option,
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
    type: IResultListItemType.Entry,
    data: entry,
    order: idx + 1,
  }));

  return [
    ...entryListItems.slice(
      entryListItems.length - RESULT_LIST_ACTIVE_LIST_INDEX,
      entryListItems.length
    ),

    createOptionItem(Option.SEARCH, Label.SEARCH, handleSearchOption),

    ...(nextPageEntries.length > 0
      ? [createOptionItem(Option.NEXT_PAGE, Label.NEXT_PAGE, handleNextPageOption)]
      : []),

    ...(currentPage > 1
      ? [createOptionItem(Option.PREV_PAGE, Label.PREV_PAGE, handlePrevPageOption)]
      : []),

    createOptionItem(
      Option.START_BULK_DOWNLOAD,
      Label.START_BULK_DOWNLOAD,
      handleStartBulkDownloadOption
    ),

    createOptionItem(Option.EXIT, Label.EXIT, handleExitOption),
    ...entryListItems.slice(0, entryListItems.length - RESULT_LIST_ACTIVE_LIST_INDEX),
  ];
};

export const getRenderedListItems = (
  cursor: number,
  listItems: ListItem[],
  anyEntryExpanded: boolean,
  activeExpandedListLength: number
) => {
  const renderedItemsLimit = Math.max(
    MIN_RESULT_LIST_LENGTH,
    anyEntryExpanded ? RESULT_LIST_LENGTH - activeExpandedListLength : RESULT_LIST_LENGTH
  );
  const renderedItems: ListItem[] = [];

  for (let i = 0; i < renderedItemsLimit; i++) {
    if (i >= listItems.length) {
      break;
    }

    const itemIndex = (cursor + i) % listItems.length;
    renderedItems.push(listItems[itemIndex]);
  }

  return renderedItems;
};

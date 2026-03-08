import { Entry } from "./api/models/entry";
import { ListItem, IResultListItemType } from "./api/models/list-item";
import {
  MIN_RESULT_LIST_LENGTH,
  RESULT_LIST_ACTIVE_LIST_INDEX,
  RESULT_LIST_LENGTH,
} from "./constants";
import { Option } from "./options";
import Label from "./labels";
import { FAIL_REQ_ATTEMPT_COUNT, FAIL_REQ_ATTEMPT_DELAY_MS } from "./settings";

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

export async function attempt<T>(
  callback: () => Promise<T>,
  onFail?: (message: string) => void,
  onError?: (message: string) => void,
  onComplete?: () => void
): Promise<T | undefined> {
  for (let index = 0; index < FAIL_REQ_ATTEMPT_COUNT; index++) {
    try {
      const result = await callback();

      if (onComplete) {
        onComplete();
      }

      return result;
    } catch (error: unknown) {
      if (onFail) {
        onFail(`Request failed, trying again ${index + 1}/${FAIL_REQ_ATTEMPT_COUNT}`);
      }
      await delay(FAIL_REQ_ATTEMPT_DELAY_MS);
      if (index + 1 === FAIL_REQ_ATTEMPT_COUNT && onError) {
          onError((error as Error)?.message);
        }
    }
  }
  return undefined;
}

export const createOptionItem = (
  id: string,
  label: string,
  onSelect: () => void,
  options?: { disabled?: boolean; showSpinner?: boolean }
): ListItem => ({
  type: IResultListItemType.Option,
  data: {
    id,
    label,
    onSelect,
    ...options,
  },
});

export type NextPageStatus = "idle" | "checking" | "ready" | "unavailable" | "error";

interface constructInitialListItemsArguments {
  entries: Entry[];
  currentPage: number;
  nextPageStatus: NextPageStatus;
  handleSearchOption: () => void;
  handleNextPageOption: () => void;
  handleRetryNextPageOption: () => void;
  handlePrevPageOption: () => void;
  handleStartBulkDownloadOption: () => void;
  handleExitOption: () => void;
}

const noop = () => {};

const getNextPageOption = (
  nextPageStatus: NextPageStatus,
  handleNextPageOption: () => void,
  handleRetryNextPageOption: () => void
): ListItem[] => {
  switch (nextPageStatus) {
    case "ready": {
      return [createOptionItem(Option.NEXT_PAGE, Label.NEXT_PAGE, handleNextPageOption)];
    }
    case "checking": {
      return [
        createOptionItem(Option.NEXT_PAGE, Label.NEXT_PAGE_CHECKING, noop, {
          disabled: true,
          showSpinner: true,
        }),
      ];
    }
    case "error": {
      return [
        createOptionItem(Option.NEXT_PAGE, Label.NEXT_PAGE_ERROR, handleRetryNextPageOption),
      ];
    }
    case "unavailable": {
      return [
        createOptionItem(Option.NEXT_PAGE, Label.NEXT_PAGE_UNAVAILABLE, noop, {
          disabled: true,
        }),
      ];
    }
    case "idle": {
      return [];
    }
  }
};

export const constructListItems = ({
  entries,
  currentPage,
  nextPageStatus,
  handleSearchOption,
  handleNextPageOption,
  handleRetryNextPageOption,
  handlePrevPageOption,
  handleStartBulkDownloadOption,
  handleExitOption,
}: constructInitialListItemsArguments) => {
  const entryListItems: ListItem[] = entries.map<ListItem>((entry, index) => ({
    type: IResultListItemType.Entry,
    data: entry,
    order: index + 1,
  }));

  return [
    ...entryListItems.slice(
      entryListItems.length - RESULT_LIST_ACTIVE_LIST_INDEX
    ),

    createOptionItem(Option.SEARCH, Label.SEARCH, handleSearchOption),

    ...getNextPageOption(nextPageStatus, handleNextPageOption, handleRetryNextPageOption),

    ...((() => {
      if (currentPage > 1) {
        return [createOptionItem(Option.PREV_PAGE, Label.PREV_PAGE, handlePrevPageOption)];
      }
      return [];
    })()),

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
    (() => {
      if (anyEntryExpanded) {
        return RESULT_LIST_LENGTH - activeExpandedListLength;
      }
      return RESULT_LIST_LENGTH;
    })()
  );
  const renderedItems: ListItem[] = [];

  for (let index = 0; index < renderedItemsLimit; index++) {
    if (index >= listItems.length) {
      break;
    }

    const itemIndex = (cursor + index) % listItems.length;
    renderedItems.push(listItems[itemIndex]);
  }

  return renderedItems;
};

export function clearText(text: string): string {
  return text
    .split("\n")[0]
    .replaceAll(/<script[^>]*>[\s\S]*?<\/script>/g, "")
    .replaceAll(/<[^>]+>/g, "")
    .trim();
}

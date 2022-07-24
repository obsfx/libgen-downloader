import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import { Entry } from "../../api/models/Entry";
import { RESULT_LIST_ACTIVE_LIST_INDEX, RESULT_LIST_LENGTH } from "../../constants/options";

export enum ResultListItem {
  Entry,
  Option,
}

export interface ResultListItemOption {
  type: ResultListItem.Option;
  data: {
    id: string;
    label: string;
    onSelect: () => void;
  };
}

export interface ResultListItemEntry {
  type: ResultListItem.Entry;
  data: Entry;
}

type ListItem = ResultListItemOption | ResultListItemEntry;

export const useListItems = () => {
  const { entries } = useAppContext();

  const [listItems, setListItems] = useState<ListItem[]>([]);

  useEffect(() => {
    const entryListItems: ListItem[] = entries.map<ListItem>((entry) => ({
      type: ResultListItem.Entry,
      data: entry,
    }));

    setListItems([
      ...entryListItems.slice(0, RESULT_LIST_ACTIVE_LIST_INDEX),
      {
        type: ResultListItem.Option,
        data: {
          id: "search_option",
          label: "Search",
          onSelect: () => {
            return undefined;
          },
        },
      },

      {
        type: ResultListItem.Option,
        data: {
          id: "next_page_option",
          label: "Next Page",
          onSelect: () => {
            return undefined;
          },
        },
      },
      {
        type: ResultListItem.Option,
        data: {
          id: "start_bulk_downloading_option",
          label: "Start Bulk Downloading",
          onSelect: () => {
            return undefined;
          },
        },
      },
      {
        type: ResultListItem.Option,
        data: {
          id: "exit_option",
          label: "Exit",
          onSelect: () => {
            return undefined;
          },
        },
      },
      ...entryListItems.slice(RESULT_LIST_ACTIVE_LIST_INDEX, entryListItems.length),
    ]);
  }, [entries]);

  const renderedItems = useMemo(() => {
    return listItems.slice(0, RESULT_LIST_LENGTH);
  }, [listItems]);

  return {
    listItems,
    renderedItems,
    setListItems,
  };
};

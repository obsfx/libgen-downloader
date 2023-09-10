import { useAtom } from "jotai";
import { FilterRecord } from "../layouts/search/search-filter/Filter.data";
import {
  currentPageAtom,
  entriesAtom,
  filtersAtom,
  listItemsCursorAtom,
  searchValueAtom,
} from "../store/app";

export const useResetApp = () => {
  const [, setSearchValue] = useAtom(searchValueAtom);
  const [, setCurrentPage] = useAtom(currentPageAtom);
  const [, setListItemsCursor] = useAtom(listItemsCursorAtom);
  const [, setEntries] = useAtom(entriesAtom);
  const [, setFilter] = useAtom(filtersAtom);

  const resetApp = () => {
    setSearchValue("");
    setCurrentPage(1);
    setEntries([]);
    setListItemsCursor(0);
    setFilter({} as FilterRecord);
  };

  return {
    resetApp,
  };
};

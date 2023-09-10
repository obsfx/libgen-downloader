import { atom } from "jotai";
import { Entry } from "../../api/models/Entry";
import { ListItem } from "../../api/models/ListItem";
import { FilterRecord } from "../layouts/search/search-filter/Filter.data";

export const isLoadingAtom = atom(false);
export const loaderMessageAtom = atom("");
export const searchValueAtom = atom("");
export const currentPageAtom = atom(1);
export const entriesAtom = atom<Entry[]>([]);
export const cachedNextPageEntriesAtom = atom<Entry[]>([]);
export const showSearchMinCharWarningAtom = atom((get) => {
  const searchValue = get(searchValueAtom);
  return searchValue.length < 3;
});
export const anyEntryExpandedAtom = atom(false);
export const activeExpandedListLengthAtom = atom(0);
export const listItemsAtom = atom<ListItem[]>([]);
export const filtersAtom = atom<FilterRecord>({} as FilterRecord);
export const detailedEntryAtom = atom<Entry | null>(null);

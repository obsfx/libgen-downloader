//import { useAtom } from "jotai";
//import { AppEvent, EventManager } from "../classes/EventEmitterManager";
//import Label from "../../labels";
//import { useSearch } from "./useSearch";
//import { useResetApp } from "./useResetApp";
//import { LAYOUT_KEY } from "../layouts/keys";
//import { useEffect } from "react";
//
//let renderCount = 0;
//export const useEventManager = () => {
//  //const [searchValue, setSearchValue] = useAtom(searchValueAtom);
//  //const [currentPage, setCurrentPage] = useAtom(currentPageAtom);
//  //const [entries, setEntries] = useAtom(readWriteEntriesAtom);
//  //const [cachedNextPageEntries, setCachedNextPageEntries] = useAtom(cachedNextPageEntriesAtom);
//  //const [, setIsLoading] = useAtom(isLoadingAtom);
//  //const [, setLoaderMessage] = useAtom(loaderMessageAtom);
//  //const [, setActiveLayout] = useAtom(activeLayoutAtom);
//  //const [, setListItemsCursor] = useAtom(listItemsCursorAtom);
//  //const [, setErrorMessage] = useAtom(errorMessageAtom);
//
//  //const { search } = useSearch();
//  //const { resetApp } = useResetApp();
//
//  useEffect(() => {
//    console.log("triggered, setSearchValue", renderCount++);
//  }, [setSearchValue]);
//
//  //EventManager.on(AppEvent.SEARCH, async () => {
//  //  setIsLoading(true);
//  //  setLoaderMessage(Label.GETTING_RESULTS);
//
//  //  const entries = await search(searchValue, currentPage);
//  //  setEntries(entries);
//
//  //  const nextPageEntries = await search(searchValue, currentPage + 1);
//
//  //  setCachedNextPageEntries(nextPageEntries);
//  //  setIsLoading(false);
//  //  setActiveLayout(LAYOUT_KEY.RESULT_LIST_LAYOUT);
//  //});
//
//  //EventManager.on(AppEvent.BACK_TO_SEARCH, () => {
//  //  resetApp();
//  //  setActiveLayout(LAYOUT_KEY.SEARCH_LAYOUT);
//  //});
//
//  //EventManager.on(AppEvent.NEXT_PAGE, async () => {
//  //  setIsLoading(true);
//  //  setLoaderMessage(Label.GETTING_RESULTS);
//
//  //  if (cachedNextPageEntries.length === 0) {
//  //    setIsLoading(false);
//  //    return;
//  //  }
//
//  //  setEntries(cachedNextPageEntries);
//
//  //  const nextPageEntries = await search(searchValue, currentPage + 2);
//  //  setCachedNextPageEntries(nextPageEntries);
//  //  setCurrentPage((prev) => prev + 1);
//  //  setListItemsCursor(0);
//  //  setIsLoading(false);
//  //});
//
//  //EventManager.on(AppEvent.PREV_PAGE, async () => {
//  //  setIsLoading(true);
//  //  setLoaderMessage(Label.GETTING_RESULTS);
//
//  //  if (currentPage < 2) {
//  //    setIsLoading(false);
//  //    return;
//  //  }
//
//  //  setCachedNextPageEntries(entries);
//
//  //  const prevPageEntries = await search(searchValue, currentPage - 1);
//  //  setEntries(prevPageEntries);
//  //  setCurrentPage((prev) => prev - 1);
//  //  setListItemsCursor(0);
//  //  setIsLoading(false);
//  //});
//
//  //EventManager.on(AppEvent.START_BULK_DOWNLOAD, () => {
//  //  console.log("START_BULK_DOWNLOAD");
//  //});
//
//  //EventManager.on(AppEvent.THROW_ERROR, (message) => {
//  //  setIsLoading(false);
//  //  setErrorMessage(message as string);
//  //});
//
//  //EventManager.on(AppEvent.EXIT, () => {
//  //  console.log("EXIT");
//  //});
//};

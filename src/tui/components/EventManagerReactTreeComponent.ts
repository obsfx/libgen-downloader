import { useAtom } from "jotai";
import { AppEvent, EventManager } from "../classes/EventEmitterManager";
import {
  activeLayoutAtom,
  cachedNextPageEntriesAtom,
  currentPageAtom,
  entriesAtom,
  isLoadingAtom,
  loaderMessageAtom,
  searchValueAtom,
} from "../store/app";
import Label from "../../labels";
import { useSearch } from "../hooks/useSearch";
import { LAYOUT_KEY } from "../layouts/keys";
import { useResetApp } from "../hooks/useResetApp";

export function EventManagerReactTreeComponent() {
  const [searchValue] = useAtom(searchValueAtom);
  const [currentPage] = useAtom(currentPageAtom);
  const [, setIsLoading] = useAtom(isLoadingAtom);
  const [, setLoaderMessage] = useAtom(loaderMessageAtom);
  const [, setEntries] = useAtom(entriesAtom);
  const [, setCachedNextPageEntries] = useAtom(cachedNextPageEntriesAtom);
  const [, setActiveLayout] = useAtom(activeLayoutAtom);

  const { search } = useSearch();
  const { resetApp } = useResetApp();

  EventManager.on(AppEvent.SEARCH, async () => {
    setIsLoading(true);
    setLoaderMessage(Label.GETTING_RESULTS);

    const entries = await search(searchValue, currentPage);
    setEntries(entries);

    const nextPageEntries = await search(searchValue, currentPage + 1);

    setCachedNextPageEntries(nextPageEntries);
    setIsLoading(false);
    setActiveLayout(LAYOUT_KEY.RESULT_LIST_LAYOUT);
  });

  EventManager.on(AppEvent.BACK_TO_SEARCH, () => {
    resetApp();
    setActiveLayout(LAYOUT_KEY.SEARCH_LAYOUT);
  });

  return null;
}

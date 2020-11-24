import { useEffect } from 'react';
import { search, isPageExist, Entry } from '../../search-api';
import { useStore, AppStatus, Item } from '../../store-provider';

const GettingResults = () => {
  const query: string = encodeURIComponent(useStore(state => state.globals.query));
  const mirror: string = useStore(state => state.globals.mirror) || '';
  const currentPage: number = useStore(state => state.globals.currentPage);
  const searchReqPattern: string = useStore(state => state.config?.searchReqPattern) || '';
  const pageSize: number = useStore(state => state.config?.pageSize) || 25;

  const setEntries: (entries: Entry[]) => void = useStore(state => state.set.entries);
  const setListBuffer: (listBuffer: Item[]) => void = useStore(state => state.set.listBuffer);
  const setStatus: (status: AppStatus) => void = useStore(state => state.set.status);
  const setNextPage: (nextPage: boolean) => void = useStore(state => state.set.nextPage);
  const seetLastFailedAction: (lastFailedAction: Function) => void = useStore(state => state.set.lastFailedAction);

  useEffect(() => {
    const doSearchRequest = async () => {
      const results: Entry[] | null = await search(searchReqPattern, mirror, query, currentPage, pageSize);

      if (results == null) {
        // throw pop up
        seetLastFailedAction(() => setStatus('gettingResults'));
        setStatus('failed');
        return;
      }

      const nextPage: boolean = await isPageExist(searchReqPattern, mirror, query, currentPage + 1, pageSize);

      if (nextPage == null) {
        // throw pop up
        seetLastFailedAction(() => setStatus('gettingResults'));
        setStatus('failed');
        return;
      }

      setNextPage(nextPage);
      setListBuffer([]);
      setEntries(results);
      setStatus('results');
    }

    doSearchRequest();
  }, []);

  return null;
}

export default GettingResults;

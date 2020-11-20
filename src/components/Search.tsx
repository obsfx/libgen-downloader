import React from 'react';
import { Box, Text } from 'ink';
import { useStore, AppStatus } from '../store-provider';
import { search, Entry } from '../search-api';
import Input from './Input';
import SearchFilters from './SearchFilters';

const Search = () => {
  const query: string = useStore(state => state.globals.query);
  const setQuery: (query: string) => void = useStore(state => state.set.query);

  const setEntries: (entries: Entry[]) => void = useStore(state => state.set.entries);

  const setStatus: (status: AppStatus) => void = useStore(state => state.set.status);

  const mirror: string = useStore(state => state.globals.mirror) || '';
  const currentPage: number = useStore(state => state.globals.currentPage);
  const searchReqPattern: string = useStore(state => state.config?.searchReqPattern) || '';
  const pageSize: number = useStore(state => state.config?.pageSize) || 25;

  const handleOnSubmit = async (query: string) => {
    setStatus('gettingResults');
    setQuery(query);

    const results: Entry[] | null = await search(searchReqPattern, mirror, query, currentPage, pageSize);

    if (results == null) {
      // throw pop up
      return;
    }

    setStatus('results');
    setEntries(results);
  }

  return (
    <Box flexDirection='column' width='100%'>
      <Text wrap='truncate'>Press [TAB] to switch between 'Search Input' and 'Show Filters'</Text>
      <Input 
        labelText='Search'
        placeholder='Search query must be min. 3 characters.'
        value={query}
        minChar={3}
        onChange={setQuery}
        onSubmit={handleOnSubmit}
      />
      <SearchFilters />
    </Box>
  )
}

export default Search;

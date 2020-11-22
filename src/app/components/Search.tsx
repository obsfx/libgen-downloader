import React, { useEffect } from 'react';
import { Box, Text } from 'ink';
import { useStore, AppStatus } from '../../store-provider';
import Input from './Input';
import SearchFilters from './SearchFilters';

const Search = () => {
  const query: string = useStore(state => state.globals.query);
  const setQuery: (query: string) => void = useStore(state => state.set.query);
  const setStatus: (status: AppStatus) => void = useStore(state => state.set.status);
  const reset: () => void = useStore(state => state.set.reset);

  useEffect(() => {
    reset();
  }, []);

  const handleOnSubmit = () => {
    setStatus('gettingResults');
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

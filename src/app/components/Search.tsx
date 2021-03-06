import React, { useEffect } from 'react';
import { Box, Text } from 'ink';
import { useStore, AppStatus } from '../../store-provider';
import Input from './Input';
import SearchFilters from './SearchFilters';
import BulkQueueIndicator from './BulkQueueIndicator';

const Search = () => {
  const query: string = useStore(state => state.globals.query);
  const setQuery: (query: string) => void = useStore(state => state.set.query);
  const setStatus: (status: AppStatus) => void = useStore(state => state.set.status);
  const reset: () => void = useStore(state => state.set.reset);

  useEffect(() => {
    reset();
  }, []);

  const handleOnSubmit = () => {
    if (query.length < 3) return;
    setStatus('gettingResults');
  }

  return (
    <Box flexDirection='column' width='100%'>
      <BulkQueueIndicator />
      <Text wrap='truncate'>
        <Text color='yellowBright'>[TAB]</Text> to switch between 'Search Input' and 'Show Filters',
        <Text color='yellowBright'> [ENTER]</Text> to Search
      </Text>
      <Input 
        labelText='Search'
        placeholder='Search string must contain minimum 3 characters.'
        value={query}
        minChar={3}
        onChange={setQuery}
        onSubmit={handleOnSubmit}
      />
      <SearchFilters onSubmit={handleOnSubmit} />
    </Box>
  )
}

export default Search;

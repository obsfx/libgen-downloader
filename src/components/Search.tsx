import React from 'react';
import { Box, Text } from 'ink';
import { useStore } from '../store-provider';
import Input from './Input';
import SearchFilters from './SearchFilters';

const Search = () => {
  const query: string = useStore(state => state.globals.query);
  const setQuery: (query: string) => void = useStore(state => state.set.query);

  return (
    <Box flexDirection='column'>
      <Text color='gray'>Press [TAB] to switch between 'Search Input' and 'Show Filters'</Text>
      <Input 
        labelText='Search'
        placeholder='Search query must be min. 3 characters.'
        minChar={3}
        value={query}
        onSubmit={(query: string) => setQuery(query)}
      />
      <SearchFilters />
    </Box>
  )
}

export default Search;

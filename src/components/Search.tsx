import React from 'react';
import { Box } from 'ink';
import { useStore } from '../store-provider';
import Input from './Input';
import SearchFilters from './SearchFilters';

const Search = () => {
  const query: string = useStore(state => state.query);
  const setQuery: (query: string) => void = useStore(state => state.setQuery);

  return (
    <Box flexDirection='column' marginTop={1}>
      <Input 
        labelText='Search'
        placeholder='Serach query must be min. 3 characters.'
        minChar={3}
        value={query}
        onSubmit={(query: string) => setQuery(query)}
      />
      <SearchFilters />
    </Box>
  )
}

export default Search;

import React from 'react';
import { useStore, Globals } from '../store-provider';
import Expand from './Expand';
import Input from './Input';

const SearchFilters = () => {
  const {
    author,
    publisher,
    year,
    pages,
    language,
    extension
  } = useStore(state => state.globals.searchFilters);

  const setSearchFilters = useStore(state => state.set.searchFilters);

  return (
    <Expand 
      showText='Show Filters'
      hideText='Hide Filters'>
      <Input 
        labelText='Author(s)'
        placeholder='Serach query must be min. 3 characters.'
        minChar={3}
        value={author}
        onSubmit={(author: string) => setSearchFilters((state: Globals) => ({ ...state.searchFilters, author }))}
      />
      <Input 
        labelText='Publisher'
        placeholder='Serach query must be min. 3 characters.'
        minChar={3}
        value={publisher}
        onSubmit={(publisher: string) => setSearchFilters((state: Globals) => ({ ...state.searchFilters, publisher }))}
      />
      <Input 
        labelText='Year'
        placeholder='Serach query must be min. 3 characters.'
        minChar={3}
        value={year}
        onSubmit={(year: string) => setSearchFilters((state: Globals) => ({ ...state.searchFilters, year }))}
      />
      <Input 
        labelText='Pages'
        placeholder='Serach query must be min. 3 characters.'
        minChar={3}
        value={pages}
        onSubmit={(pages: string) => setSearchFilters((state: Globals) => ({ ...state.searchFilters, pages }))}
      />
      <Input 
        labelText='Language'
        placeholder='Serach query must be min. 3 characters.'
        minChar={3}
        value={language}
        onSubmit={(language: string) => setSearchFilters((state: Globals) => ({ ...state.searchFilters, language }))}
      />
      <Input 
        labelText='Extension'
        placeholder='Serach query must be min. 3 characters.'
        minChar={3}
        value={extension}
        onSubmit={(extension: string) => setSearchFilters((state: Globals) => ({ ...state.searchFilters, extension }))}
      />
    </Expand>
  )
}

export default SearchFilters;

import React from 'react';
import { useStore, Globals } from '../../store-provider';
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
        value={author}
        onChange={(author: string) => setSearchFilters((state: Globals) => ({ ...state.searchFilters, author }))}
      />
      <Input 
        labelText='Publisher'
        value={publisher}
        onChange={(publisher: string) => setSearchFilters((state: Globals) => ({ ...state.searchFilters, publisher }))}
      />
      <Input 
        labelText='Year'
        value={year}
        onChange={(year: string) => setSearchFilters((state: Globals) => ({ ...state.searchFilters, year }))}
      />
      <Input 
        labelText='Pages'
        value={pages}
        onChange={(pages: string) => setSearchFilters((state: Globals) => ({ ...state.searchFilters, pages }))}
      />
      <Input 
        labelText='Language'
        value={language}
        onChange={(language: string) => setSearchFilters((state: Globals) => ({ ...state.searchFilters, language }))}
      />
      <Input 
        labelText='Extension'
        value={extension}
        onChange={(extension: string) => setSearchFilters((state: Globals) => ({ ...state.searchFilters, extension }))}
      />
    </Expand>
  )
}

export default SearchFilters;

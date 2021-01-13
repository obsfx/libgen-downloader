import React from 'react';
import { useStore, Globals } from '../../store-provider';
import Expand from './Expand';
import Input from './Input';

type Props = {
  onSubmit: () => void
}

const SearchFilters = (props: Props) => {
  const { onSubmit }= props;

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
        onSubmit={onSubmit}
      />
      <Input 
        labelText='Publisher'
        value={publisher}
        onChange={(publisher: string) => setSearchFilters((state: Globals) => ({ ...state.searchFilters, publisher }))}
        onSubmit={onSubmit}
      />
      <Input 
        labelText='Year'
        value={year}
        onChange={(year: string) => setSearchFilters((state: Globals) => ({ ...state.searchFilters, year }))}
        onSubmit={onSubmit}
      />
      <Input 
        labelText='Pages'
        value={pages}
        onChange={(pages: string) => setSearchFilters((state: Globals) => ({ ...state.searchFilters, pages }))}
        onSubmit={onSubmit}
      />
      <Input 
        labelText='Language'
        value={language}
        onChange={(language: string) => setSearchFilters((state: Globals) => ({ ...state.searchFilters, language }))}
        onSubmit={onSubmit}
      />
      <Input 
        labelText='Extension'
        value={extension}
        onChange={(extension: string) => setSearchFilters((state: Globals) => ({ ...state.searchFilters, extension }))}
        onSubmit={onSubmit}
      />
    </Expand>
  )
}

export default SearchFilters;

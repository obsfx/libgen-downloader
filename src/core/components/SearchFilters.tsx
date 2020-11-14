import React from 'react';
import useStore from '../../store-provider';
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
  } = useStore(state => state.searchFilters);
  const setSearchFilters = useStore(state => state.setSearchFilters);

  return (
    <Expand>
      <Input 
        labelText='Author(s)'
        placeholder='Serach query must be min. 3 characters.'
        minChar={3}
        value={author}
        onSubmit={(author: string) => setSearchFilters(state => ({ ...state.searchFilters, author }))}
      />
      <Input 
        labelText='Publisher'
        placeholder='Serach query must be min. 3 characters.'
        minChar={3}
        value={publisher}
        onSubmit={(publisher: string) => setSearchFilters(state => ({ ...state.searchFilters, publisher }))}
      />
      <Input 
        labelText='Year'
        placeholder='Serach query must be min. 3 characters.'
        minChar={3}
        value={year}
        onSubmit={(year: string) => setSearchFilters(state => ({ ...state.searchFilters, year }))}
      />
      <Input 
        labelText='Pages'
        placeholder='Serach query must be min. 3 characters.'
        minChar={3}
        value={pages}
        onSubmit={(pages: string) => setSearchFilters(state => ({ ...state.searchFilters, pages }))}
      />
      <Input 
        labelText='Language'
        placeholder='Serach query must be min. 3 characters.'
        minChar={3}
        value={language}
        onSubmit={(language: string) => setSearchFilters(state => ({ ...state.searchFilters, language }))}
      />
      <Input 
        labelText='Extension'
        placeholder='Serach query must be min. 3 characters.'
        minChar={3}
        value={extension}
        onSubmit={(extension: string) => setSearchFilters(state => ({ ...state.searchFilters, extension }))}
      />
    </Expand>
  )
}

export default SearchFilters;

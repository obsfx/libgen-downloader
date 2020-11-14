import React from 'react';
import useStore from '../../store-provider';
import Expand from './Expand';
import Input from './Input';

const SearchFilters = () => {
  const author: string = useStore(state => state.author);
  const publisher: string = useStore(state => state.publisher);
  const year: string = useStore(state => state.year);
  const pages: string = useStore(state => state.pages);
  const language: string = useStore(state => state.language);
  const extension: string = useStore(state => state.extension);

  const setAuthor: (author: string) => void = useStore(state => state.setAuthor);
  const setPublisher: (publisher: string) => void = useStore(state => state.setPublisher);
  const setYear: (year: string) => void = useStore(state => state.setYear);
  const setPages: (pages: string) => void = useStore(state => state.setPages);
  const setLanguage: (language: string) => void = useStore(state => state.setLanguage);
  const setExtension: (extension: string) => void = useStore(state => state.setExtension);

  return (
    <Expand>
      <Input 
        labelText='Author(s)'
        placeholder='Serach query must be min. 3 characters.'
        minChar={3}
        value={author}
        onSubmit={setAuthor}
      />
      <Input 
        labelText='Publisher'
        placeholder='Serach query must be min. 3 characters.'
        minChar={3}
        value={publisher}
        onSubmit={setPublisher}
      />
      <Input 
        labelText='Year'
        placeholder='Serach query must be min. 3 characters.'
        minChar={3}
        value={year}
        onSubmit={setYear}
      />
      <Input 
        labelText='Pages'
        placeholder='Serach query must be min. 3 characters.'
        minChar={3}
        value={pages}
        onSubmit={setPages}
      />
      <Input 
        labelText='Language'
        placeholder='Serach query must be min. 3 characters.'
        minChar={3}
        value={language}
        onSubmit={setLanguage}
      />
      <Input 
        labelText='Extension'
        placeholder='Serach query must be min. 3 characters.'
        minChar={3}
        value={extension}
        onSubmit={setExtension}
      />
    </Expand>
  )
}

export default SearchFilters;

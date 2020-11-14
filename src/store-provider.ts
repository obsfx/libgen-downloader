import create, { SetState } from 'zustand';
import { version } from '../package.json';

type SearchFilters = {
  author: string,
  publisher: string,
  year: string,
  pages: string,
  language: string,
  extension: string,
}

type State = {
  version: string,
  appWidth: number,
  query: string,
  searchFilters: {
    author: string,
    publisher: string,
    year: string,
    pages: string,
    language: string,
    extension: string,
  },
  setAppWidth: (appWidth: number) => void,
  setQuery: (query: string) => void,
  setSearchFilters: (callback: (state: State) => SearchFilters) => void,
}

const useStore = create<State>((set: SetState<State>): State => ({
  version,
  appWidth: 0,
  query: '',
  searchFilters: {
    author: '',
    publisher: '',
    year: '',
    pages: '',
    language: '',
    extension: '',
  },
  setAppWidth: (appWidth: number) => set({ appWidth }),
  setQuery: (query: string) => set({ query }),
  setSearchFilters: (callback: (state: State) => SearchFilters) => set(state => ({ searchFilters: callback(state) }))
}));

export default useStore;

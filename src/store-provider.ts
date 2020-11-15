import create, { SetState } from 'zustand';
import { version } from '../package.json';

type SearchFilters = {
  author: string;
  publisher: string;
  year: string;
  pages: string;
  language: string;
  extension: string;
}

export type Entry = {
  id: string;
  author: string;
  title: string;
  publisher: string;
  year: string;
  pages: string;
  lang: string;
  size: string;
  ext: string;
  mirror: string;
}

type State = {
  version: string;
  appWidth: number;
  errorStatus: boolean;
  currentPage: number;
  mirror: string;
  entries: Entry[];
  query: string;
  searchFilters: {
    author: string;
    publisher: string;
    year: string;
    pages: string;
    language: string;
    extension: string;
  };
  reset: () => void;
  setAppWidth: (appWidth: number) => void;
  setErrorStatus: (errorStatus: boolean) => void;
  setCurrentPage: (callback: (state: State) => number) => void;
  setMirror: (mirror: string) => void;
  setEntries: (entries: Entry[]) => void;
  setQuery: (query: string) => void;
  setSearchFilters: (callback: (state: State) => SearchFilters) => void;
}

export const useStore = create<State>((set: SetState<State>): State => ({
  version,
  appWidth: 0,
  errorStatus: false,
  currentPage: 1,
  mirror: '',
  entries: [],
  query: '',
  searchFilters: {
    author: '',
    publisher: '',
    year: '',
    pages: '',
    language: '',
    extension: '',
  },
  reset: () => set({
    errorStatus: false,
    currentPage: 1,
    mirror: '',
    entries: [],
    query: '',
    searchFilters: {
      author: '',
      publisher: '',
      year: '',
      pages: '',
      language: '',
      extension: '',
    },
  }),
  setAppWidth: (appWidth: number) => set({ appWidth }),
  setErrorStatus: (errorStatus: boolean) => set({ errorStatus }),
  setCurrentPage: (callback: (state: State) => number) => set(state => ({ currentPage: callback(state) })),
  setMirror: (mirror: string) => set({ mirror }),
  setEntries: (entries: Entry[]) => set({ entries }),
  setQuery: (query: string) => set({ query }),
  setSearchFilters: (callback: (state: State) => SearchFilters) => set(state => ({ searchFilters: callback(state) }))
}));

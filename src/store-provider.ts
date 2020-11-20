import create, { SetState } from 'zustand';
import { Entry } from './search-api';

//type SearchFilters = {
//  author: string;
//  publisher: string;
//  year: string;
//  pages: string;
//  language: string;
//  extension: string;
//}

export type Config = {
  mirrors: string[];
  pageSize: number;
  searchReqPattern: string;
  searchByMD5Pattern: string;
  MD5ReqPattern: string;
  cssSelectors: {
    tableContainer: string;
    row: string;
    downloadURL: string;
    cellSelector: string;
  }
}

export type AppStatus = 'fetchingConfig' |
  'findingMirror' |
  'search' |
  'gettingResults' |
  'results' |
  'entryDetails';

export type Globals = {
  status: AppStatus;
  appWidth: number;
  errorStatus: boolean;
  currentPage: number;
  mirror: string | null;
  entries: Entry[];
  bulkQueue: string[];
  query: string;
  searchFilters: {
    author: string;
    publisher: string;
    year: string;
    pages: string;
    language: string;
    extension: string;
  };
}

type Setters = {
  reset: () => void;
  config: (config: Config) => void;
  status: (status: AppStatus) => void;
  appWidth: (appWidth: number) => void;
  errorStatus: (errorStatus: boolean) => void;
  currentPage: (callback: Function) => void;
  mirror: (mirror: string) => void;
  entries: (entries: Entry[]) => void;
  bulkQueue: (bulkQueue: string[]) => void;
  query: (query: string) => void;
  searchFilters: (callback: Function) => void;
}

type State = {
  config: Config | null;
  globals: Globals;
  set: Setters;
}

const initialGlobals: Globals = {
  status: 'fetchingConfig',
  appWidth: 0,
  errorStatus: false,
  currentPage: 1,
  mirror: null,
  entries: [],
  bulkQueue: [],
  query: '',
  searchFilters: {
    author: '',
    publisher: '',
    year: '',
    pages: '',
    language: '',
    extension: '',
  }
}

export const useStore = create<State>((set: SetState<State>): State => ({
  config: null,
  globals: { ...initialGlobals },
  set: {
    reset: () => set({ globals: { ...initialGlobals  } }),
    config: (config: Config) => set({ config: { ...config } }),
    status: (status: AppStatus) => set(state => ({ globals: { ...state.globals, status } })),
    appWidth: (appWidth: number) => set(state => ({ globals: { ...state.globals, appWidth } })),
    errorStatus: (errorStatus: boolean) => set(state => ({ globals: { ...state.globals, errorStatus } })),
    currentPage: (callback: Function) => set(state => ({ globals: { ...state.globals, currentPage: callback(state.globals) } })),
    mirror: (mirror: string) => set(state => ({ globals: { ...state.globals, mirror } })),
    entries: (entries: Entry[]) => set(state => ({ globals: { ...state.globals, entries } })),
    bulkQueue: (bulkQueue: string[]) => set(state => ({ globals: { ...state.globals, bulkQueue } })),
    query: (query: string) => set(state => ({ globals: { ...state.globals, query } })),
    searchFilters: (callback: Function) => set(state => ({ globals: { ...state.globals, searchFilters: callback(state.globals) } }))
  }
}));

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

export enum returnedValue {
  seeDetails,
  downloadDirectly,
  addToBulkDownloadingQueue,
  removeFromBulkDownloadingQueue,
  turnBackToTheList,
  nextPage,
  prevPage,
  startBulkDownloading,
  search,
  exit,
  tryAgain,
  searchAnother
}

export type Item = {
  key: string;
  data: Entry | null;
  value: returnedValue | null;
  text: string;
  expandable: boolean;
}

export type AppStatus = 'fetchingConfig' |
  'findingMirror' |
  'search' |
  'gettingResults' |
  'results' |
  'entryDetails' |
  'failed';

//export type Config = {
//  mirrors: string[];
//  pageSize: number;
//  searchReqPattern: string;
//  searchByMD5Pattern: string;
//  MD5ReqPattern: string;
//  cssSelectors: {
//    tableContainer: string;
//    row: string;
//    downloadURL: string;
//    cellSelector: string;
//  }
//}

export type Globals = {
  status: AppStatus;
  lastFailedAction: Function;
  errorCounter: number;
  executed: boolean;
  configFetched: boolean;
  currentPage: number;
  mirror: string | null;
  entries: Entry[];
  entryBuffer: Entry | null;
  listBuffer: Item[];
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
  config: (config: any) => void;
  status: (status: AppStatus) => void;
  lastFailedAction: (lastFailedAction: Function) => void;
  errorCounter: (errorCounter: number) => void;
  executed: (configFetched: boolean) => void;
  configFetched: (configFetched: boolean) => void;
  currentPage: (callback: Function) => void;
  mirror: (mirror: string) => void;
  entries: (entries: Entry[]) => void;
  entryBuffer: (entryBuffer: Entry) => void;
  listBuffer: (listBuffer: Item[]) => void;
  bulkQueue: (bulkQueue: string[]) => void;
  query: (query: string) => void;
  searchFilters: (callback: Function) => void;
}

type State = {
  config: any | null;
  globals: Globals;
  set: Setters;
}

const initialGlobals: Globals = {
  status: 'fetchingConfig',
  lastFailedAction: () => null,
  errorCounter: 0,
  executed: false,
  configFetched: false,
  currentPage: 1,
  mirror: null,
  entries: [],
  entryBuffer: null,
  listBuffer: [],
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
    config: (config: any) => set({ config: { ...config } }),
    status: (status: AppStatus) => set(state => ({ globals: { ...state.globals, status } })),
    lastFailedAction: (lastFailedAction: Function) => set(state => ({ globals: { ...state.globals, lastFailedAction } })),
    errorCounter: (errorCounter: number) => set(state => ({ globals: { ...state.globals, errorCounter } })),
    executed: (executed: boolean) => set(state => ({ globals: { ...state.globals, executed } })),
    configFetched: (configFetched: boolean) => set(state => ({ globals: { ...state.globals, configFetched } })),
    currentPage: (callback: Function) => set(state => ({ globals: { ...state.globals, currentPage: callback(state.globals) } })),
    mirror: (mirror: string) => set(state => ({ globals: { ...state.globals, mirror } })),
    entries: (entries: Entry[]) => set(state => ({ globals: { ...state.globals, entries } })),
    entryBuffer: (entryBuffer: Entry) => set(state => ({ globals: { ...state.globals, entryBuffer } })),
    listBuffer: (listBuffer: Item[]) => set(state => ({ globals: { ...state.globals, listBuffer } })),
    bulkQueue: (bulkQueue: string[]) => set(state => ({ globals: { ...state.globals, bulkQueue } })),
    query: (query: string) => set(state => ({ globals: { ...state.globals, query } })),
    searchFilters: (callback: Function) => set(state => ({ globals: { ...state.globals, searchFilters: callback(state.globals) } }))
  }
}));

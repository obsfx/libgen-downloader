import create, { SetState } from 'zustand';
import { Entry } from './search-api';
import { ReactNode } from 'react';

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
  searchAnother,
  empty
}

export type Item = {
  key: string;
  data: Entry | null;
  value: returnedValue | null;
  text: ReactNode;
  expandable: boolean;
}

export type AppStatus = 'fetchingConfig' |
  'findingMirror' |
  'search' |
  'gettingResults' |
  'results' |
  'entryDetails' |
  'bulkDownloadingID' |
  'bulkDownloadingMD5' |
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
  initialStatus: AppStatus;
  nextPage: boolean;
  lastFailedAction: Function;
  errorCounter: number;
  currentPage: number;
  mirror: string | null;
  entries: Entry[];
  entryBuffer: Entry | null;
  listBuffer: Item[];
  bulkQueue: string[];
  downloadQueue: Entry[];
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
  initialStatus: (initialStatus: AppStatus) => void;
  nextPage: (nextPage: boolean) => void;
  lastFailedAction: (lastFailedAction: Function) => void;
  errorCounter: (errorCounter: number) => void;
  currentPage: (currentPage: number) => void;
  mirror: (mirror: string) => void;
  entries: (entries: Entry[]) => void;
  entryBuffer: (entryBuffer: Entry) => void;
  listBuffer: (listBuffer: Item[]) => void;
  bulkQueue: (bulkQueue: string[]) => void;
  downloadQueue: (callback: Function) => void;
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
  initialStatus: 'search',
  nextPage: false,
  lastFailedAction: () => null,
  errorCounter: 0,
  currentPage: 1,
  mirror: null,
  entries: [],
  entryBuffer: null,
  listBuffer: [],
  bulkQueue: [],
  downloadQueue: [],
  query: '',
  searchFilters: {
    author: '',
    publisher: '',
    year: '',
    pages: '',
    language: '',
    extension: ''
  }
}

export const useStore = create<State>((set: SetState<State>): State => ({
  config: null,
  globals: { ...initialGlobals },
  set: {
    reset: () => set(state => ({ 
      globals: { 
        ...state.globals,
        nextPage: false,
        lastFailedAction: () => null,
        errorCounter: 0,
        currentPage: 1,
        entries: [],
        entryBuffer: null,
        listBuffer: [],
        query: '',
        searchFilters: {
          author: '',
          publisher: '',
          year: '',
          pages: '',
          language: '',
          extension: ''
        }
    } })),
    config: (config: any) => set({ config: { ...config } }),
    status: (status: AppStatus) => set(state => ({ globals: { ...state.globals, status } })),
    initialStatus: (initialStatus: AppStatus) => set(state => ({ globals: { ...state.globals, initialStatus } })),
    nextPage: (nextPage: boolean) => set(state => ({ globals: { ...state.globals, nextPage } })),
    lastFailedAction: (lastFailedAction: Function) => set(state => ({ globals: { ...state.globals, lastFailedAction } })),
    errorCounter: (errorCounter: number) => set(state => ({ globals: { ...state.globals, errorCounter } })),
    currentPage: (currentPage: number) => set(state => ({ globals: { ...state.globals, currentPage } })),
    mirror: (mirror: string) => set(state => ({ globals: { ...state.globals, mirror } })),
    entries: (entries: Entry[]) => set(state => ({ globals: { ...state.globals, entries } })),
    entryBuffer: (entryBuffer: Entry) => set(state => ({ globals: { ...state.globals, entryBuffer } })),
    listBuffer: (listBuffer: Item[]) => set(state => ({ globals: { ...state.globals, listBuffer } })),
    bulkQueue: (bulkQueue: string[]) => set(state => ({ globals: { ...state.globals, bulkQueue } })),
    downloadQueue: (callback: Function) => set(state => ({ globals: { ...state.globals, downloadQueue: callback(state.globals.downloadQueue) } })),
    query: (query: string) => set(state => ({ globals: { ...state.globals, query } })),
    searchFilters: (callback: Function) => set(state => ({ globals: { ...state.globals, searchFilters: callback(state.globals) } }))
  }
}));

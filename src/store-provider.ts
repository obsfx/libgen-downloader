import create, { SetState } from 'zustand';
import { version } from '../package.json';

type State = {
  version: string,
  appWidth: number,
  query: string,
  author: string,
  publisher: string,
  year: string,
  pages: string,
  language: string,
  extension: string,
  setAppWidth: (appWidth: number) => void,
  setQuery: (query: string) => void,
  setAuthor: (author: string) => void,
  setPublisher: (publisher: string) => void,
  setYear: (year: string) => void,
  setPages: (pages: string) => void,
  setLanguage: (language: string) => void,
  setExtension: (extension: string) => void
}

const useStore = create<State>((set: SetState<State>): State => ({
  version,
  appWidth: 0,
  query: '',
  author: '',
  publisher: '',
  year: '',
  pages: '',
  language: '',
  extension: '',
  setAppWidth: (appWidth: number) => set({ appWidth }),
  setQuery: (query: string) => set({ query }),
  setAuthor: (author: string) => set({ author }),
  setPublisher: (publisher: string) => set({ publisher }),
  setYear: (year: string) => set({ year }),
  setPages: (pages: string) => set({ pages }),
  setLanguage: (language: string) => set({ language }),
  setExtension: (extension: string) => set({ extension })
}));

export default useStore;

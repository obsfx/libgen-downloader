import fetch, { Response } from 'node-fetch';
import { JSDOM } from 'jsdom';
import config from './config.json';

export type Entry = {
  id: string;
  author: string;
  title: string;
  publisher: string;
  year: string;
  pages: string;
  language: string;
  size: string;
  extension: string;
  mirror: string;
}

const Columns: { [key: string]: number } = {
  id: 1,
  author: 2,
  title: 3,
  publisher: 4,
  year: 5,
  pages: 6,
  language: 7,
  size: 8,
  extension: 9,
  mirror: 10
}

/**
* internal helpers
*/
const sleep = (ms: number): Promise<void> => (
  new Promise((resolve: Function) => setTimeout(() => resolve(), ms))
);

const constructURL = (mirror: string, query: string, pageNumber: number): string => (
    config.SEARCH_REQ
    .replace('{mirror}', mirror)
    .replace('{query}', query)
    .replace('{pageNumber}', pageNumber.toString())
    .replace('{pageSize}', config.RESULTS_PAGE_SIZE.toString())
);

const getResponse = async (URL: string): Promise<Response | null> => {
  try {
    const response: Response = await fetch(URL);
    return (response.status == 200 && !response.redirected) ?
      response :
      null;
  } catch(error) {
    return null;
  }
}

const getDocument = async (URL: string): Promise<HTMLDocument | null> => {
    let response: Response | null = await getResponse(URL);

    if (response == null) {
      return null;
    }

    const plainText: string = await response.text();
    return new JSDOM(plainText).window.document;
}

const getText = (document: HTMLDocument, selector: string): string => (
  document.querySelector(selector)?.textContent || ' '
);

const getCellSelector = (row: number, col: number): string => (
  config.SELECTORS.CELL_SELECTOR
  .replace('{tableContainerSelector}', config.SELECTORS.TABLE_CONTAINER)
  .replace('{row}', row.toString())
  .replace('{col}', col.toString())
);

const getEntrySelectors = (row: number): Entry => ({
  id: getCellSelector(row, Columns.id),
  author: getCellSelector(row, Columns.author),
  title: getCellSelector(row, Columns.title),
  publisher: getCellSelector(row, Columns.publisher),
  year: getCellSelector(row, Columns.year),
  pages: getCellSelector(row, Columns.pages),
  language: getCellSelector(row, Columns.language),
  size: getCellSelector(row, Columns.size),
  extension: getCellSelector(row, Columns.extension),
  mirror: getCellSelector(row, Columns.mirror)
});

const getEntryData = (document: HTMLDocument, selector: Entry): Entry => ({
  id: getText(document, selector.id),
  author: getText(document, selector.author),
  title: getText(document, selector.title),
  publisher: getText(document, selector.publisher),
  year: getText(document, selector.year),
  pages: getText(document, selector.pages),
  language: getText(document, selector.language),
  size: getText(document, selector.size),
  extension: getText(document, selector.extension),
  mirror: document.querySelector(selector.mirror)?.getAttribute('href') || ' '
});

const getEntries = (document: HTMLDocument): Entry[] => {
  const entries: Entry[] = [];
  const entryLength: number = document.querySelectorAll(config.SELECTORS.ROW).length;

  for (let i: number = 1; i < entryLength; i++) {
    const selectors: Entry = getEntrySelectors(i + 1);
    entries.push(getEntryData(document, selectors));
  }

  return entries;
}

/**
* exported api
*/
export const doRequest = (
  reqURL: string, 
  onErr: (attempt: number, tolarance: number) => void, 
  errTolarance: number, 
  delay: number): Promise<Response | null> => (
  new Promise(async (resolve: Function) => {
    let errCount: number = 0;
    let response: Response | null = null;

    while (errCount < errTolarance) {
      response = await getResponse(reqURL);

      if (response == null) {
        errCount++;
        onErr(errCount + 1, errTolarance);
        await sleep(delay);
      } else {
        resolve(response);
        break;
      }
    }

    resolve(null);
  })
);

export const findMirror = async (mirrorList: string[]): Promise<string> => {
  for (let i: number = 0; i < mirrorList.length; i++) {
    const response: Response | null = await getResponse(mirrorList[i]);

    if (response != null) return mirrorList[i];
  }

  return '';
}

export const isPageExist = async (mirror: string, query: string, pageNumber: number): Promise<boolean> => {
  const searchURL: string = constructURL(mirror, query, pageNumber);
  const document: HTMLDocument | null = await getDocument(searchURL);

  return (document && document.querySelectorAll(config.SELECTORS.ROW).length > 1) ? true : false;
}

export const search = async (mirror: string, query: string, pageNumber: number): Promise<Entry[] | null> => {
  const searchURL: string = constructURL(mirror, query, pageNumber);
  const document: HTMLDocument | null = await getDocument(searchURL);

  if (document == null) return null;

  let entries: Entry[] = getEntries(document);

  return entries;
}

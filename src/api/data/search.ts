import { JSDOM } from "jsdom";
import bent from "bent";
import { Entry } from "../models/Entry";
import { TABLE_CONTAINER_SELECTOR } from "../../constants";

export interface constructSearchURLParams {
  query: string;
  pageNumber: number;
  pageSize: number;
  mirror: string;
  searchReqPattern: string;
}
export function constructSearchURL({
  query,
  pageNumber,
  pageSize,
  mirror,
  searchReqPattern,
}: constructSearchURLParams): string {
  return searchReqPattern
    .replace("{mirror}", mirror)
    .replace("{query}", query)
    .replace("{pageNumber}", pageNumber.toString())
    .replace("{pageSize}", pageSize.toString());
}

export async function getDocument(searchURL: string): Promise<Document> {
  const getString = bent("string");

  try {
    const response = await getString(searchURL);
    return new JSDOM(response).window.document;
  } catch (e) {
    throw Error(`Error occured while fetching document of ${searchURL}`);
  }
}

export function parseEntries(document: Document): Entry[] {
  const entries: Entry[] = [];
  const containerTable = document.querySelector<HTMLTableElement>(TABLE_CONTAINER_SELECTOR);

  if (!containerTable) {
    throw new Error("containerTable is undefined");
  }

  // Get rid of table header by slicing it
  const entryElements = Array.from(containerTable.children).slice(1);

  for (let i = 0; i < entryElements.length; i++) {
    const element = entryElements[i];

    const id = element.children[0]?.textContent || "";
    const authors = element.children[1]?.textContent || "";
    const title = element.children[2]?.textContent || "";
    const publisher = element.children[3]?.textContent || "";
    const year = element.children[4]?.textContent || "";
    const pages = element.children[5]?.textContent || "";
    const language = element.children[6]?.textContent || "";
    const size = element.children[7]?.textContent || "";
    const extension = element.children[8]?.textContent || "";
    const mirror = element.children[9]?.children[0]?.getAttribute("href") || "";

    entries.push({
      id,
      authors,
      title,
      publisher,
      year,
      pages,
      language,
      size,
      extension,
      mirror,
      downloadUrls: [],
    });
  }

  return entries;
}

import { parseHTML } from "linkedom";
import { fetchLibgen } from "./request";

export interface DocumentResult {
  document: Document;
  htmlString: string;
}

export async function getDocument(searchURL: string, signal: AbortSignal): Promise<DocumentResult> {
  try {
    const response = await fetchLibgen(searchURL, signal);
    const htmlString = await response.text();
    const { document } = parseHTML(htmlString);
    return { document: document as unknown as Document, htmlString };
  } catch {
    throw new Error(`Error occured while fetching document of ${searchURL}`);
  }
}

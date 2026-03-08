import { parseHTML } from "linkedom";

export interface DocumentResult {
  document: Document;
  htmlString: string;
}

export async function getDocument(searchURL: string): Promise<DocumentResult> {
  try {
    const response = await fetch(searchURL);
    const htmlString = await response.text();
    const { document } = parseHTML(htmlString);
    return { document: document as unknown as Document, htmlString };
  } catch {
    throw new Error(`Error occured while fetching document of ${searchURL}`);
  }
}

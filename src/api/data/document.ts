import { parseHTML } from "linkedom";

export async function getDocument(searchURL: string): Promise<Document> {
  try {
    const response = await fetch(searchURL);
    const htmlString = await response.text();
    const { document } = parseHTML(htmlString);
    return document as unknown as Document;
  } catch (e) {
    throw new Error(`Error occured while fetching document of ${searchURL}`);
  }
}

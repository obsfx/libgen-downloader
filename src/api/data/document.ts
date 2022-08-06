import { JSDOM } from "jsdom";
import bent from "bent";

export async function getDocument(searchURL: string): Promise<Document> {
  const getString = bent("string");

  try {
    const response = await getString(searchURL);
    return new JSDOM(response).window.document;
  } catch (e) {
    throw new Error(`Error occured while fetching document of ${searchURL}`);
  }
}

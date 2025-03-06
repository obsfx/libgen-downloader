import { JSDOM } from "jsdom";
import fetch from "node-fetch";

export async function getDocument(searchURL: string): Promise<Document> {
  try {
    const response = await fetch(searchURL);

    // Check for HTTP errors
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const htmlString = await response.text();
    return new JSDOM(htmlString).window.document;
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    throw new Error(`Error occurred while fetching document of ${searchURL}: ${errorMessage}`);
  }
}

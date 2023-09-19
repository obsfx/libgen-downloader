import { JSDOM } from "jsdom";
import fetch from "node-fetch";

export async function getDocument(searchURL: string): Promise<Document> {
  try {
    console.log("response", searchURL);
    const response = await fetch(searchURL);
    const htmlString = await response.text();
    return new JSDOM(htmlString).window.document;
  } catch (e) {
    throw new Error(`Error occured while fetching document of ${searchURL}`);
  }
}

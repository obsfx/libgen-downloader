import { JSDOM } from "jsdom";
import fetch from "node-fetch";
import { RateLimiter } from "../../utils";

// Limit to 2 requests per second to be gentle on the server
const rateLimiter = new RateLimiter(2);

/**
 * Fetch an HTML document from a URL
 * @param url The URL to fetch
 * @returns A JSDOM instance for the document
 */
export async function getDocument(url: string): Promise<JSDOM> {
  await rateLimiter.limit();

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch document: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  return new JSDOM(html);
}

/**
 * Safely close all JSDOM instances to prevent memory leaks
 * @param documents Array of JSDOM instances to close
 */
export function closeDocuments(...documents: (JSDOM | undefined | null)[]): void {
  for (const doc of documents) {
    if (doc) {
      try {
        doc.window.close();
      } catch (error) {
        console.error("Error closing JSDOM window:", error);
      }
    }
  }
}

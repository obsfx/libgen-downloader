import { parseHTML } from "linkedom";
import type { SourceFailure } from "../types";

const ALERT_SELECTORS = [".alert-danger", ".alert"];
const FALLBACK_SELECTORS = ["h1", "title"];
const MAX_SUMMARY_LENGTH = 120;

function firstText(document: Document, selectors: string[]): string {
  for (const selector of selectors) {
    const text = document.querySelector(selector)?.textContent?.replaceAll(/\s+/g, " ").trim();
    if (text) {
      return text.slice(0, MAX_SUMMARY_LENGTH);
    }
  }
  return "";
}

export function pageAlertText(document: Document): string {
  return firstText(document, ALERT_SELECTORS);
}

export async function responseErrorSummary(response: Response): Promise<string> {
  try {
    const html = await response.text();
    const { document } = parseHTML(html);
    return firstText(document, [...ALERT_SELECTORS, ...FALLBACK_SELECTORS]);
  } catch {
    return "";
  }
}

const MAX_LISTED_FAILURES = 3;

export function summarizeFailures(failures: SourceFailure[]): string {
  if (failures.length === 0) {
    return "no download sources are configured";
  }
  const listed = failures
    .slice(0, MAX_LISTED_FAILURES)
    .map(({ sourceName, reason }) => `${sourceName}: ${reason}`);
  const remaining = failures.length - listed.length;
  if (remaining > 0) {
    listed.push(`${remaining} more`);
  }
  return `tried ${failures.length} sources (${listed.join("; ")})`;
}

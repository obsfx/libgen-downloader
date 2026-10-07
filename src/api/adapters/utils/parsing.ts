import type { ColumnMap, EntryColumn } from "../types";

const DEFAULT_COLUMN_MAP: ColumnMap = {
  title: 0,
  authors: 1,
  publisher: 2,
  year: 3,
  language: 4,
  pages: 5,
  size: 6,
  extension: 7,
  mirrors: 8,
};

const HEADER_PATTERNS: [EntryColumn, RegExp][] = [
  ["authors", /author/i],
  ["publisher", /publisher/i],
  ["year", /^\s*year/i],
  ["language", /language/i],
  ["pages", /pages/i],
  ["size", /^\s*size/i],
  ["extension", /^\s*ext/i],
  ["mirrors", /mirror/i],
  ["title", /title/i],
];

function headerRow(table: Element): Element | undefined {
  const theadRow = table.querySelector("thead tr");
  if (theadRow) {
    return theadRow;
  }
  return [...table.querySelectorAll("tr")].find((row) => row.querySelector("th"));
}

export function columnMapFromTable(table: Element): ColumnMap {
  const headerCells = [...(headerRow(table)?.children ?? [])];
  if (headerCells.length === 0) {
    return DEFAULT_COLUMN_MAP;
  }
  const headerTexts = headerCells.map((cell) => (cell.textContent ?? "").replaceAll(/\s+/g, " "));
  const columnMap: ColumnMap = { ...DEFAULT_COLUMN_MAP };
  const claimed = new Set<number>();
  for (const [column, pattern] of HEADER_PATTERNS) {
    const index = headerTexts.findIndex(
      (text, position) => !claimed.has(position) && pattern.test(text)
    );
    if (index === -1) {
      return DEFAULT_COLUMN_MAP;
    }
    columnMap[column] = index;
    claimed.add(index);
  }
  return columnMap;
}

const MD5_PATTERN = /[a-f0-9]{32}/i;

export function extractMD5(link: string, baseURL: string): string | undefined {
  const parameter = URL.parse(link, baseURL)?.searchParams.get("md5");
  if (parameter) {
    return parameter;
  }
  return MD5_PATTERN.exec(link)?.[0];
}

export function isSameHostLink(link: string, baseURL: string): boolean {
  const linkURL = URL.parse(link, baseURL);
  return Boolean(linkURL) && linkURL?.host === URL.parse(baseURL)?.host;
}

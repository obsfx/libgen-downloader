import { Entry } from "../models/entry";
import { Adapter } from "./adapter";
import { nanoid } from "nanoid";
import { clearText } from "../../utilities";
import type { ResolverFactory } from "../resolution/resolver-factory";
import { RESOLUTION_INTENTS } from "../resolution/intents";
import { appServices } from "../services/shared-services";
import type { ColumnMap } from "./types";
import { columnMapFromTable } from "./utils/parsing";
import { extractMD5, isSameHostLink } from "./utils/parsing";
import {
  LIBGEN_PLUS_CONNECTION_ERROR_SELECTOR,
  LIBGEN_PLUS_SELECTORS,
} from "./libgen-plus-selectors";

export class LibgenPlusAdapter implements Adapter {
  baseURL: string;

  constructor(
    baseURL: string,
    private readonly resolvers?: ResolverFactory
  ) {
    this.baseURL = baseURL;
  }

  get scopeKey(): string {
    return new URL(this.baseURL).host;
  }

  isHiddenField(fieldName: string): boolean {
    return !["id"].includes(fieldName);
  }

  async resolveEntries(document: Document, pageURL: string, signal: AbortSignal): Promise<Entry[]> {
    const resolver = this.resolverFactory().createResultsTableResolver(
      LIBGEN_PLUS_SELECTORS.resultsTable
    );
    try {
      const outcome = await resolver.resolve({
        task: "results-table",
        scopeKey: this.scopeKey,
        document,
        pageUrl: pageURL,
        intent: RESOLUTION_INTENTS["results-table"],
        signal,
      });
      if (!outcome.resolved) {
        return [];
      }
      return this.parseTableRows(outcome.resolution.payload);
    } finally {
      await resolver.release();
    }
  }

  resolverFactory(): ResolverFactory {
    return this.resolvers ?? appServices().resolverFactory;
  }

  getEntryMD5(entry: Entry): string | undefined {
    return extractMD5(entry.mirror, this.baseURL);
  }

  private parseTableRows(table: Element): Entry[] {
    const columns = columnMapFromTable(table);
    return this.resultRows(table).map((row) => this.parseRow(row, columns));
  }

  private resultRows(table: Element): Element[] {
    const body = table.querySelector("tbody");
    if (body) {
      return [...body.children].filter((row) => row.tagName === "TR");
    }
    return [...table.querySelectorAll("tr")].filter((row) => !row.querySelector("th"));
  }

  private parseRow(row: Element, columns: ColumnMap): Entry {
    const cellText = (index: number) => {
      return clearText(row.children[index]?.textContent || "");
    };
    const authors = cellText(columns.authors)
      .split(";")
      .map((author) => author.trim())
      .join(", ");
    const titleSectionContent = [...(row.children[columns.title]?.children ?? [])]
      .filter((child) => child.nodeName !== "NOBR")
      .map((element) => element.textContent?.trim())
      .filter(Boolean)
      .join(" / ");

    return {
      id: nanoid(),
      authors,
      title: clearText(titleSectionContent || ""),
      publisher: cellText(columns.publisher),
      year: cellText(columns.year),
      pages: cellText(columns.pages),
      language: cellText(columns.language),
      size: cellText(columns.size),
      extension: cellText(columns.extension),
      mirror: this.mirrorLink(row.children[columns.mirrors]),
    };
  }

  private mirrorLink(cell: Element | undefined): string {
    const hrefs = [...(cell?.querySelectorAll("a[href]") ?? [])].map(
      (anchor) => anchor.getAttribute("href") ?? ""
    );
    const libgenLink = hrefs.find(
      (href) => isSameHostLink(href, this.baseURL) && extractMD5(href, this.baseURL)
    );
    return libgenLink ?? hrefs[0] ?? "";
  }

  private getPageURL(pathname: string): string {
    const url = new URL(pathname, this.baseURL);
    return url.toString();
  }

  getSearchURL(query: string, pageNumber: number, pageSize: number): string {
    const url = new URL("/index.php", this.baseURL);
    url.searchParams.set("req", query);
    url.searchParams.set("page", pageNumber.toString());
    url.searchParams.set("res", pageSize.toString());
    return url.toString();
  }

  getDetailPageURL(md5: string): string {
    const url = new URL("/ads.php", this.baseURL);
    url.searchParams.set("md5", md5);
    return url.toString();
  }

  detectConnectionError(document: Document): string | undefined {
    const alertElement = document.querySelector(LIBGEN_PLUS_CONNECTION_ERROR_SELECTOR);
    if (alertElement) {
      return alertElement.textContent?.trim() || "Unknown connection error";
    }
    return undefined;
  }

  formatField(fieldName: string, value: string): string {
    switch (fieldName) {
      case "authors": {
        return value
          .split(", ")
          .map((author) => author.trim())
          .join(", ");
      }
      case "title": {
        return value.trim();
      }
      case "publisher":
      case "year":
      case "pages":
      case "language":
      case "size":
      case "extension": {
        return value.trim();
      }
      case "mirror": {
        if (value.startsWith("http")) {
          return value;
        }
        return this.getPageURL(value);
      }
      default: {
        return value;
      }
    }
  }
}

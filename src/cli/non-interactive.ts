// eslint-disable-next-line unicorn/prefer-node-protocol
import fs from "fs";
// eslint-disable-next-line unicorn/prefer-node-protocol
import path from "path";
import { getAdapter } from "../api/adapters";
import type { Adapter } from "../api/adapters/adapter";
import { fetchConfig, findMirror } from "../api/data/config";
import { downloadFile } from "../api/data/download";
import { getDocument } from "../api/data/document";
import type { Entry } from "../api/models/entry";
import { SEARCH_PAGE_SIZE } from "../settings";

interface CLIOptions {
  extension?: string;
  json: boolean;
  page: number;
  limit: number;
  outputDirectory: string;
  quiet: boolean;
}

interface SearchResultEntry {
  md5: string;
  title: string;
  authors: string;
  publisher: string;
  year: string;
  pages: string;
  language: string;
  size: string;
  extension: string;
  mirror: string;
}

interface DownloadItemResult {
  md5: string;
  status: "downloaded" | "failed";
  path?: string;
  error?: string;
}

interface RuntimeContext {
  adapter: Adapter;
  mirrorSource: string;
}

const MD5_REGEX = /^[\da-f]{32}$/i;

function normalizeExtensionFilter(extensionValue?: string): Set<string> | undefined {
  if (!extensionValue) {
    return;
  }

  const extensions = extensionValue
    .split(",")
    .map((item) => item.trim().toLowerCase().replace(/^\./, ""))
    .filter(Boolean);

  if (extensions.length === 0) {
    return;
  }

  return new Set(extensions);
}

function normalizeEntryExtension(extension: string): string {
  return extension.trim().toLowerCase().replace(/^\./, "");
}

function extractMD5FromMirrorURL(adapter: Adapter, mirror: string): string {
  const mirrorURL = adapter.getPageURL(mirror);
  const url = new URL(mirrorURL);
  return url.searchParams.get("md5") || "";
}

function mapEntry(adapter: Adapter, entry: Entry): SearchResultEntry {
  return {
    md5: extractMD5FromMirrorURL(adapter, entry.mirror),
    title: entry.title,
    authors: entry.authors,
    publisher: entry.publisher,
    year: entry.year,
    pages: entry.pages,
    language: entry.language,
    size: entry.size,
    extension: entry.extension,
    mirror: adapter.getPageURL(entry.mirror),
  };
}

function parsePositiveInteger(
  value: unknown,
  defaultValue: number,
  flagLabel: string
): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return defaultValue;
  }

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${flagLabel} must be a positive integer`);
  }

  return value;
}

function parseOutputDirectory(value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    return process.cwd();
  }

  return path.resolve(value);
}

function getCLIOptions(flags: Record<string, unknown>): CLIOptions {
  let extension: string | undefined;
  if (typeof flags.extension === "string") {
    extension = flags.extension;
  }

  return {
    extension,
    json: flags.json === true,
    page: parsePositiveInteger(flags.page, 1, "--page"),
    limit: parsePositiveInteger(flags.limit, SEARCH_PAGE_SIZE, "--limit"),
    outputDirectory: parseOutputDirectory(flags.output),
    quiet: flags.quiet === true,
  };
}

async function getRuntimeContext(): Promise<RuntimeContext> {
  const config = await fetchConfig();
  const mirror = await findMirror(config.mirrors, () => {});

  if (!mirror) {
    throw new Error("Couldn't find a working mirror");
  }

  return {
    adapter: getAdapter(mirror.src, mirror.type),
    mirrorSource: mirror.src,
  };
}

function printSearchResults(results: SearchResultEntry[]) {
  if (results.length === 0) {
    console.log("No results found.");
    return;
  }

  for (const [index, result] of results.entries()) {
    console.log(`[${index + 1}] ${result.title}`);
    console.log(`    md5: ${result.md5}`);
    console.log(`    authors: ${result.authors}`);
    console.log(`    language: ${result.language} | extension: ${result.extension} | size: ${result.size}`);
    console.log(`    year: ${result.year} | publisher: ${result.publisher}`);
    console.log(`    mirror: ${result.mirror}`);
  }
}

function assertValidMD5(md5: string) {
  if (!MD5_REGEX.test(md5)) {
    throw new Error(`Invalid MD5 value: ${md5}`);
  }
}

async function resolveDownloadURL(context: RuntimeContext, md5: string): Promise<string> {
  const detailPageURL = context.adapter.getDetailPageURL(md5);
  const detailPageResult = await getDocument(detailPageURL);

  const connectionError = context.adapter.detectConnectionError(detailPageResult.document);
  if (connectionError) {
    throw new Error(connectionError);
  }

  const downloadURL = context.adapter.getMainDownloadURLFromDocument(detailPageResult.document);
  if (!downloadURL) {
    throw new Error(`Couldn't find download URL for ${md5}`);
  }

  return downloadURL;
}

async function performDownload(
  context: RuntimeContext,
  md5: string,
  options: CLIOptions,
  index: number,
  total: number
): Promise<DownloadItemResult> {
  const logPrefix = `[${index + 1}/${total}]`;
  if (!options.quiet) {
    console.log(`${logPrefix} Resolving download URL for ${md5}...`);
  }

  try {
    const downloadURL = await resolveDownloadURL(context, md5);
    const downloadStream = await fetch(downloadURL);
    if (!downloadStream.ok) {
      throw new Error(`Download request failed with status ${downloadStream.status}`);
    }

    let downloaded = 0;
    let latestLoggedPercent = -1;

    const result = await downloadFile({
      downloadStream,
      outputDirectory: options.outputDirectory,
      onStart: (filename, totalSize) => {
        if (!options.quiet) {
          console.log(`${logPrefix} Downloading ${filename} (${totalSize} bytes)`);
        }
      },
      onData: (_filename, chunk, totalSize) => {
        if (options.quiet) {
          return;
        }

        downloaded += chunk.length;
        if (totalSize <= 0) {
          return;
        }

        const percent = Math.floor((downloaded / totalSize) * 100);
        if (percent < latestLoggedPercent + 10 && percent !== 100) {
          return;
        }

        latestLoggedPercent = percent;
        console.log(`${logPrefix} ${percent}%`);
      },
    });

    if (!options.quiet) {
      console.log(`${logPrefix} Saved to ${result.path}`);
    }

    return {
      md5,
      status: "downloaded",
      path: result.path,
    };
  } catch (error: unknown) {
    const message = (error as Error).message;
    console.error(`${logPrefix} Failed ${md5}: ${message}`);
    return {
      md5,
      status: "failed",
      error: message,
    };
  }
}

export async function runSearchCommand(
  query: string,
  flags: Record<string, unknown>
): Promise<void> {
  const options = getCLIOptions(flags);
  const context = await getRuntimeContext();

  const searchURL = context.adapter.getSearchURL(query, options.page, options.limit);
  const searchDocument = await getDocument(searchURL);
  const connectionError = context.adapter.detectConnectionError(searchDocument.document);
  if (connectionError) {
    throw new Error(connectionError);
  }

  const entries = context.adapter.parseEntries(searchDocument.document);
  if (!entries) {
    throw new Error(`Couldn't parse the search page for "${query}"`);
  }

  const extensionFilter = normalizeExtensionFilter(options.extension);
  const filteredEntries: Entry[] = [];
  for (const entry of entries) {
    if (!extensionFilter) {
      filteredEntries.push(entry);
      continue;
    }

    const entryExtension = normalizeEntryExtension(entry.extension);
    if (extensionFilter.has(entryExtension)) {
      filteredEntries.push(entry);
    }
  }

  const results = filteredEntries.map((entry) => mapEntry(context.adapter, entry));

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          query,
          page: options.page,
          limit: options.limit,
          extensionFilter: options.extension,
          mirror: context.mirrorSource,
          count: results.length,
          results,
        },
        undefined,
        2
      )
    );
    return;
  }

  console.log(`Active mirror: ${context.mirrorSource}`);
  console.log(`Query: ${query}`);
  console.log(`Page: ${options.page} | Limit: ${options.limit}`);
  if (options.extension) {
    console.log(`Extension filter: ${options.extension}`);
  }
  console.log("");
  printSearchResults(results);
}

export async function runURLCommand(md5: string, flags: Record<string, unknown>): Promise<void> {
  const options = getCLIOptions(flags);
  assertValidMD5(md5);

  const context = await getRuntimeContext();
  const downloadURL = await resolveDownloadURL(context, md5);

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          md5,
          mirror: context.mirrorSource,
          downloadURL,
        },
        undefined,
        2
      )
    );
    return;
  }

  console.log(`Active mirror: ${context.mirrorSource}`);
  console.log("Here is the direct download link:");
  console.log(downloadURL);
}

function sanitizeMD5List(values: string[]): string[] {
  const uniqueValues = new Set<string>();

  for (const value of values) {
    const md5 = value.trim();
    if (md5.length === 0) {
      continue;
    }

    if (!MD5_REGEX.test(md5)) {
      console.error(`Skipping invalid MD5: ${md5}`);
      continue;
    }

    uniqueValues.add(md5);
  }

  return [...uniqueValues];
}

export async function readMD5List(filePath: string): Promise<string[]> {
  const content = await fs.promises.readFile(filePath, "utf8");
  return sanitizeMD5List(content.split(/\r?\n/u));
}

export async function runDownloadCommand(
  md5List: string[],
  flags: Record<string, unknown>
): Promise<void> {
  const options = getCLIOptions(flags);
  const normalizedMD5List = sanitizeMD5List(md5List);

  if (normalizedMD5List.length === 0) {
    throw new Error("No valid MD5 values provided");
  }

  const context = await getRuntimeContext();
  if (!options.quiet) {
    console.log(`Active mirror: ${context.mirrorSource}`);
    console.log(`Output directory: ${options.outputDirectory}`);
  }

  const results: DownloadItemResult[] = [];
  for (const [index, md5] of normalizedMD5List.entries()) {
    results.push(await performDownload(context, md5, options, index, normalizedMD5List.length));
  }

  const failedItems = results.filter((result) => result.status === "failed");
  const downloadedItems = results.filter((result) => result.status === "downloaded");

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          total: results.length,
          downloaded: downloadedItems.length,
          failed: failedItems.length,
          results,
        },
        undefined,
        2
      )
    );
  } else {
    console.log("");
    console.log("Download summary");
    console.log(`Total: ${results.length}`);
    console.log(`Downloaded: ${downloadedItems.length}`);
    console.log(`Failed: ${failedItems.length}`);
  }

  if (failedItems.length > 0) {
    process.exitCode = 1;
  }
}

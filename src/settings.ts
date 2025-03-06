import https from "https";

export const SCREEN_BASE_APP_WIDTH = 80;
export const SCREEN_PADDING = 5;
export const SCREEN_WIDTH_PERC = 95;

/**
 * URL for fetching the application configuration
 */
export const CONFIGURATION_URL =
  "https://raw.githubusercontent.com/obsfx/libgen-downloader/configuration/config.json";

/**
 * Default application settings
 */
export const DEFAULT_SETTINGS = {
  downloadDirectory: process.cwd(),
  maxConcurrentDownloads: 3,
  defaultMirrors: ["https://libgen.li/", "https://libgen.vg/"],
};

export const FAIL_REQ_ATTEMPT_COUNT = 5;
export const FAIL_REQ_ATTEMPT_DELAY_MS = 2000;

export const SEARCH_PAGE_SIZE = 25;

// https agent to bypass SSL rejection
export const httpAgent = new https.Agent({
  rejectUnauthorized: false,
});

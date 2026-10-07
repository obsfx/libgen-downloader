import { version } from "../package.json";
import type { BackoffPolicy, MirrorHealthState } from "./api/availability/types";
import type { MirrorType } from "./api/data/types";

export const SCREEN_BASE_APP_WIDTH = 80;
export const SCREEN_PADDING = 5;
export const SCREEN_WIDTH_PERC = 95;

export const CONFIGURATION_URL =
  "https://raw.githubusercontent.com/obsfx/libgen-downloader/configuration/config.v3.json";

export const FAIL_REQ_ATTEMPT_COUNT = 5;
export const FAIL_REQ_ATTEMPT_DELAY_MS = 2000;
export const REQUEST_TIMEOUT_MS = 10_000;

export const SEARCH_PAGE_SIZE = 25;
export const SEARCH_RESOLUTION_TIMEOUT_MS = 60_000;

export const LIBGEN_USER_AGENT = `libgen-downloader/${version}`;

export const DOWNLOAD_SOURCE_ATTEMPT_COUNT = 2;
export const DOWNLOAD_SOURCE_TIMEOUT_MS = 30_000;
export const BULK_RETRY_PASSES = 1;

export const LIBGEN_RECOVERY_BACKOFF: BackoffPolicy = {
  initialMs: 15_000,
  maxMs: 300_000,
  factor: 2,
  jitterRatio: 0.2,
};
export const MIRROR_COOLDOWN_BACKOFF: BackoffPolicy = LIBGEN_RECOVERY_BACKOFF;
export const HEALTH_CHECK_TIMEOUT_MS = 20_000;
export const CLI_MAX_LIBGEN_WAIT_MS = 30 * 60_000;
export const MAX_BOOK_WAIT_MS = 90_000;

export const SUPPORTED_MIRROR_TYPES = new Set<string>([
  "libgen-plus",
  "libgen-spa",
] satisfies MirrorType[]);
export const MIRROR_STATE_PRIORITY = {
  trial: 0,
  healthy: 1,
  "cooling-down": 2,
} satisfies Record<MirrorHealthState, number>;
export const SPA_LINK_TOKEN_PARAMETER = "l";
export const TEXT_CONTENT_TYPE = /^text\//i;

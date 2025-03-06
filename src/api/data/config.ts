import fetch from "node-fetch";
import { CONFIGURATION_URL } from "../../settings";

export interface Config {
  latestVersion: string;
  mirrors: string[];
  searchReqPattern: string;
  searchByMD5Pattern: string;
  MD5ReqPattern: string;
  columnFilterQueryParamKey: string;
  columnFilterQueryParamValues: Record<string, string>;
}

export async function fetchConfig(): Promise<Config> {
  try {
    const response = await fetch(CONFIGURATION_URL);
    const json = await response.json();
    const conf = json as Record<string, unknown>;

    return {
      latestVersion: (conf["latest_version"] as string) || "",
      mirrors: (conf["mirrors"] as string[]) || [],
      searchReqPattern: (conf["searchReqPattern"] as string) || "",
      searchByMD5Pattern: (conf["searchByMD5Pattern"] as string) || "",
      MD5ReqPattern: (conf["MD5ReqPattern"] as string) || "",
      columnFilterQueryParamKey: (conf["columnFilterQueryParamKey"] as string) || "",
      columnFilterQueryParamValues:
        (conf["columnFilterQueryParamValues"] as Record<string, string>) || {},
    };
  } catch (e) {
    throw new Error("Error occured while fetching configuration.");
  }
}

/**
 * Finds an available mirror from the provided list
 *
 * Known working mirrors as of 2023:
 * - https://libgen.li
 * - https://libgen.vg
 * - https://libgen.mx (untested)
 * - https://libgen.gs (untested)
 * - https://libgen.la (untested)
 *
 * Note: libgen.li and libgen.vg may contain ads when browsed without an adblocker
 */
// Add this function near the top of the file
async function fetchWithTimeout(url: string, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// Then update the findMirror function to use it
export async function findMirror(
  mirrors: string[],
  onMirrorFail: (failedMirror: string) => void
): Promise<string | null> {
  // Try the provided mirrors first
  for (let i = 0; i < mirrors.length; i++) {
    const mirror = mirrors[i];
    try {
      await fetchWithTimeout(mirror, 5000); // 5 second timeout
      return mirror;
    } catch (e) {
      onMirrorFail(mirror);
    }
  }

  // If all provided mirrors fail, try these known working mirrors as fallbacks
  const fallbackMirrors = [
    "https://libgen.li/",
    "https://libgen.vg/",
    "https://libgen.mx/",
    "https://libgen.gs/",
    "https://libgen.la/"
  ];

  for (let i = 0; i < fallbackMirrors.length; i++) {
    const mirror = fallbackMirrors[i];
    // Skip if this mirror was already in the original list
    if (mirrors.includes(mirror)) continue;

    try {
      await fetchWithTimeout(mirror, 5000); // Use fetchWithTimeout here too
      return mirror;
    } catch (e) {
      onMirrorFail(mirror);
    }
  }

  return null;
}

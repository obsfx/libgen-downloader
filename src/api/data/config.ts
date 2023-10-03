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

export async function findMirror(
  mirrors: string[],
  onMirrorFail: (failedMirror: string) => void
): Promise<string | null> {
  for (let i = 0; i < mirrors.length; i++) {
    const mirror = mirrors[i];
    try {
      await fetch(mirror);
      return mirror;
    } catch (e) {
      onMirrorFail(mirror);
    }
  }
  return null;
}

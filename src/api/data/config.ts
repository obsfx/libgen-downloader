import { CONFIGURATION_URL } from "../../settings";
import { attempt } from "../../utilities";
import type { AttemptOptions } from "../../utilities";
import { fetchLibgen } from "./request";

export type MirrorType = "libgen-plus";

export interface Mirror {
  src: string;
  type: MirrorType;
}

export interface Config {
  latestVersion: string;
  mirrors: Mirror[];
}

export async function fetchConfig(signal: AbortSignal): Promise<Config> {
  try {
    const response = await fetch(CONFIGURATION_URL, { signal });
    const json = await response.json();
    const config = json as Record<string, unknown>;

    return {
      latestVersion: (config["latest_version"] as string) || "",
      mirrors: (config["mirrors"] as Mirror[]) || [],
    };
  } catch {
    throw new Error("Error occurred while fetching configuration.");
  }
}

export async function findMirror(
  mirrors: Mirror[],
  onMirrorFail: (failedMirror: string) => void,
  attemptOptions?: AttemptOptions
): Promise<Mirror | undefined> {
  for (const mirror of mirrors) {
    const response = await attempt((signal) => fetchLibgen(mirror.src, signal), attemptOptions);
    if (response) {
      return mirror;
    }

    onMirrorFail(mirror.src);
  }
  return undefined;
}

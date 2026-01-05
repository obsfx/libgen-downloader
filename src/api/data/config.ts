import { CONFIGURATION_URL } from "../../settings";

export type MirrorType = "libgen-plus";

export interface Mirror {
  src: string;
  type: MirrorType;
}

export interface Config {
  latestVersion: string;
  mirrors: Mirror[];
}

export async function fetchConfig(): Promise<Config> {
  try {
    const response = await fetch(CONFIGURATION_URL);
    const json = await response.json();
    const conf = json as Record<string, unknown>;

    return {
      latestVersion: (conf["latest_version"] as string) || "",
      mirrors: (conf["mirrors"] as Mirror[]) || [],
    };
  } catch (e) {
    throw new Error("Error occurred while fetching configuration.");
  }
}

export async function findMirror(
  mirrors: Mirror[],
  onMirrorFail: (failedMirror: string) => void
): Promise<Mirror | null> {
  for (let i = 0; i < mirrors.length; i++) {
    const mirror = mirrors[i];
    try {
      await fetch(mirror.src);
      return mirror;
    } catch (e) {
      onMirrorFail(mirror.src);
    }
  }
  return null;
}

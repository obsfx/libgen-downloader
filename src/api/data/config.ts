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
  onMirrorFail: (failedMirror: string) => void
): Promise<Mirror | undefined> {
  for (const mirror of mirrors) {
    try {
      await fetch(mirror.src);
      return mirror;
    } catch {
      onMirrorFail(mirror.src);
    }
  }
  return undefined;
}

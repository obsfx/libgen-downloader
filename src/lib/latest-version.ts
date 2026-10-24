export abstract class LatestVersion {
  private static readonly configurationUrl =
    "https://raw.githubusercontent.com/obsfx/libgen-downloader/configuration/config.v3.json";
  private static readonly fallback = "3.4.0";

  static async read(): Promise<string> {
    try {
      const response = await fetch(LatestVersion.configurationUrl);
      const { latest_version: version } = (await response.json()) as { latest_version?: unknown };
      if (typeof version === "string" && /^\d+\.\d+\.\d+$/.test(version)) {
        return version;
      }
    } catch {
      return LatestVersion.fallback;
    }
    return LatestVersion.fallback;
  }
}

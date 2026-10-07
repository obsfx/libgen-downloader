import { readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const APP_DIRECTORY_NAME = "libgen-downloader";

export function cacheDirectory(): string {
  const override = process.env.LIBGEN_DOWNLOADER_CACHE_DIR;
  if (override) {
    return override;
  }
  if (process.platform === "win32") {
    const localAppData = process.env.LOCALAPPDATA ?? path.join(os.homedir(), "AppData", "Local");
    return path.join(localAppData, APP_DIRECTORY_NAME);
  }
  if (process.platform === "darwin") {
    return path.join(os.homedir(), "Library", "Caches", APP_DIRECTORY_NAME);
  }
  const xdgCache = process.env.XDG_CACHE_HOME ?? path.join(os.homedir(), ".cache");
  return path.join(xdgCache, APP_DIRECTORY_NAME);
}

function resolveAssetPath(assetPath: string): string {
  if (path.isAbsolute(assetPath)) {
    return assetPath;
  }
  return fileURLToPath(new URL(assetPath, import.meta.url));
}

export function readEmbeddedAsset(assetPath: string, signal: AbortSignal): Promise<Uint8Array> {
  return readFile(resolveAssetPath(assetPath), { signal });
}

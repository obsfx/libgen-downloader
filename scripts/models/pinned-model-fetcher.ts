import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { EMBEDDED_RERANKER, HUGGING_FACE_ORIGIN } from "./manifest";
import type { FetchedFile, PinnedFile, PinnedModel } from "./types";

export abstract class PinnedModelFetcher {
  private static readonly rootDirectory = path.join(import.meta.dir, "..", "..");

  static async ensure(model: PinnedModel): Promise<FetchedFile[]> {
    const directory = path.join(PinnedModelFetcher.rootDirectory, model.directory);
    await mkdir(directory, { recursive: true });
    const fetched: FetchedFile[] = [];
    for (const file of model.files) {
      const target = path.join(directory, file.target);
      const cached = await PinnedModelFetcher.isVerified(target, file);
      if (cached) {
        fetched.push({ target, status: "cached" });
        continue;
      }
      const bytes = await PinnedModelFetcher.download(model, file);
      const temporaryPath = `${target}.${process.pid}.tmp`;
      await writeFile(temporaryPath, bytes);
      await rename(temporaryPath, target);
      fetched.push({ target, status: "downloaded" });
    }
    return fetched;
  }

  private static async isVerified(target: string, file: PinnedFile): Promise<boolean> {
    try {
      const bytes = await readFile(target);
      return PinnedModelFetcher.checksum(bytes) === file.sha256;
    } catch {
      return false;
    }
  }

  private static async download(model: PinnedModel, file: PinnedFile): Promise<Uint8Array> {
    const url = `${HUGGING_FACE_ORIGIN}/${model.repository}/resolve/${model.revision}/${file.source}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Download failed (${response.status}): ${url}`);
    }
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const actual = PinnedModelFetcher.checksum(bytes);
    if (actual !== file.sha256) {
      throw new Error(
        `Checksum mismatch for ${file.source}: expected ${file.sha256}, got ${actual}`
      );
    }
    return bytes;
  }

  private static checksum(bytes: Uint8Array): string {
    return createHash("sha256").update(bytes).digest("hex");
  }
}

if (import.meta.main) {
  const fetched = await PinnedModelFetcher.ensure(EMBEDDED_RERANKER);
  for (const file of fetched) {
    console.log(`${file.status.padEnd(10)} ${path.relative(process.cwd(), file.target)}`);
  }
}

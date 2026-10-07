import type { ModelAssets } from "./types";

export abstract class ModelSource {
  abstract load(signal: AbortSignal): Promise<ModelAssets>;
}

import { readEmbeddedAsset } from "../utils/files";
import { ModelSource } from "./model-source";
import type { ModelAssets } from "./types";

export class EmbeddedRerankerSource extends ModelSource {
  async load(signal: AbortSignal): Promise<ModelAssets> {
    const { EMBEDDED_RERANKER_FILES } = await import("./embedded-reranker-files");
    const [model, tokenizer, tokenizerConfig] = await Promise.all([
      readEmbeddedAsset(EMBEDDED_RERANKER_FILES.model, signal),
      readEmbeddedAsset(EMBEDDED_RERANKER_FILES.tokenizer, signal),
      readEmbeddedAsset(EMBEDDED_RERANKER_FILES.tokenizerConfig, signal),
    ]);
    return { model, tokenizer, tokenizerConfig };
  }
}

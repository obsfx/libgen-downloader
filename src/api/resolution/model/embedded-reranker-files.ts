import modelPath from "../../../../assets/models/reranker/model.onnx" with { type: "file" };
import tokenizerPath from "../../../../assets/models/reranker/tokenizer.asset" with { type: "file" };
import tokenizerConfigPath from "../../../../assets/models/reranker/tokenizer-config.asset" with { type: "file" };
import type { ModelAssetPaths } from "./types";

export const EMBEDDED_RERANKER_FILES = {
  model: modelPath,
  tokenizer: tokenizerPath,
  tokenizerConfig: tokenizerConfigPath,
} satisfies ModelAssetPaths;

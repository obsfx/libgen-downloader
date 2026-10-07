import type { Tokenizer } from "@huggingface/tokenizers";
import type { InferenceSession } from "onnxruntime-web";

export type OnnxRuntime = typeof import("onnxruntime-web");

export interface LoadedModel {
  runtime: OnnxRuntime;
  session: InferenceSession;
  tokenizer: Tokenizer;
}

export interface ModelAssets {
  model: Uint8Array;
  tokenizer: Uint8Array;
  tokenizerConfig: Uint8Array;
}

export interface ModelAssetPaths {
  model: string;
  tokenizer: string;
  tokenizerConfig: string;
}

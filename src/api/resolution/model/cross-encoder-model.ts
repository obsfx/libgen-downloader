import type { InferenceSession, Tensor } from "onnxruntime-web";
import { int64Tensor, MAX_SEQUENCE_LENGTH } from "./cross-encoder-settings";
import wasmBinaryPath from "onnxruntime-web/ort-wasm-simd-threaded.wasm" with { type: "file" };
import { readEmbeddedAsset } from "../utils/files";
import { UnsupportedModelInputError } from "../../../errors";
import type { ModelSource } from "./model-source";
import type { LoadedModel, OnnxRuntime } from "./types";

export class CrossEncoderModel {
  private loaded: Promise<LoadedModel> | undefined;

  constructor(private readonly source: ModelSource) {}

  async score(query: string, documents: string[], signal: AbortSignal): Promise<number[]> {
    const model = await this.load(signal);
    const scores: number[] = [];
    for (const document of documents) {
      signal.throwIfAborted();
      const output = await model.session.run(this.feeds(model, query, document));
      const [logits] = Object.values(output);
      scores.push(Number(logits.data[0]));
    }
    return scores;
  }

  async release(): Promise<void> {
    const loaded = this.loaded;
    this.loaded = undefined;
    if (loaded) {
      const model = await loaded;
      await model.session.release();
    }
  }

  private feeds(model: LoadedModel, query: string, document: string): InferenceSession.FeedsType {
    const encoding = model.tokenizer.encode(query, {
      text_pair: document,
      return_token_type_ids: true,
    });
    const length = Math.min(encoding.ids.length, MAX_SEQUENCE_LENGTH);
    const features = new Map([
      ["input_ids", encoding.ids],
      ["attention_mask", encoding.attention_mask],
      ["token_type_ids", encoding.token_type_ids],
    ]);
    const feeds = new Map<string, Tensor>();
    for (const name of model.session.inputNames) {
      const values = features.get(name);
      if (!values) {
        throw new UnsupportedModelInputError(name);
      }
      feeds.set(name, int64Tensor(model.runtime, values, length));
    }
    return Object.fromEntries(feeds);
  }

  private load(signal: AbortSignal): Promise<LoadedModel> {
    if (!this.loaded) {
      this.loaded = this.createModel(signal).catch((error) => {
        this.loaded = undefined;
        throw error;
      });
    }
    return this.loaded;
  }

  private async createModel(signal: AbortSignal): Promise<LoadedModel> {
    const [assets, wasmBinary, runtime, { Tokenizer }] = await Promise.all([
      this.source.load(signal),
      readEmbeddedAsset(wasmBinaryPath, signal),
      import("onnxruntime-web/wasm") as Promise<OnnxRuntime>,
      import("@huggingface/tokenizers"),
    ]);
    runtime.env.wasm.numThreads = 1;
    runtime.env.wasm.wasmBinary = wasmBinary;
    const decoder = new TextDecoder();
    const tokenizer = new Tokenizer(
      JSON.parse(decoder.decode(assets.tokenizer)),
      JSON.parse(decoder.decode(assets.tokenizerConfig))
    );
    const session = await runtime.InferenceSession.create(assets.model);
    return { runtime, session, tokenizer };
  }
}

import type { PinnedModel } from "./types";

export const HUGGING_FACE_ORIGIN = "https://huggingface.co";

export const EMBEDDED_RERANKER = {
  repository: "Xenova/ms-marco-TinyBERT-L-2-v2",
  revision: "b76bb5e1fefd66aa36cd108622d768e86c015ff1",
  directory: "assets/models/reranker",
  files: [
    {
      source: "onnx/model_int8.onnx",
      target: "model.onnx",
      sha256: "f24d6dcf08df3d26b8fba3886942575b64856deba7ac2aa0962c2fb2ccd6d895",
    },
    {
      source: "tokenizer.json",
      target: "tokenizer.asset",
      sha256: "d241a60d5e8f04cc1b2b3e9ef7a4921b27bf526d9f6050ab90f9267a1f9e5c66",
    },
    {
      source: "tokenizer_config.json",
      target: "tokenizer-config.asset",
      sha256: "0b29c7bfc889e53b36d9dd3e686dd4300f6525110eaa98c76a5dafceb2029f53",
    },
  ],
} satisfies PinnedModel;

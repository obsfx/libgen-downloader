import type { Tensor } from "onnxruntime-web";
import type { OnnxRuntime } from "./types";

export const MAX_SEQUENCE_LENGTH = 256;

export function int64Tensor(runtime: OnnxRuntime, values: number[], length: number): Tensor {
  return new runtime.Tensor("int64", BigInt64Array.from(values.slice(0, length), BigInt), [
    1,
    length,
  ]);
}

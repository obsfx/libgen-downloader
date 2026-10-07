declare module "*.wasm" {
  const filePath: string;
  export = filePath;
}

declare module "*.onnx" {
  const filePath: string;
  export = filePath;
}

declare module "*.asset" {
  const filePath: string;
  export = filePath;
}

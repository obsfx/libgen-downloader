import { FILE_SIGNATURES, HTML_PREFIX } from "./settings";

export function matchesFileSignature(head: Uint8Array, extension: string): boolean {
  const signatures = FILE_SIGNATURES.get(extension.toLowerCase());
  if (!signatures) {
    return head.length > 0 && !HTML_PREFIX.test(Buffer.from(head.slice(0, 64)).toString("latin1"));
  }
  return signatures.some(({ offset, bytes }) =>
    bytes.every((byte, index) => head[offset + index] === byte)
  );
}

export async function readHead(response: Response, byteCount: number): Promise<Uint8Array> {
  const reader = response.body?.getReader();
  if (!reader) {
    return new Uint8Array();
  }
  const chunks: Uint8Array[] = [];
  let received = 0;
  while (received < byteCount) {
    const { done, value } = await reader.read();
    if (done || !value) {
      break;
    }
    chunks.push(value);
    received += value.length;
  }
  await reader.cancel();
  return new Uint8Array(Buffer.concat(chunks)).slice(0, byteCount);
}

export function timestamp(): string {
  return new Date().toISOString().slice(11, 19);
}

// eslint-disable-next-line unicorn/prefer-node-protocol
import fs from "fs";

async function writeMD5ListFile(md5List: string[], filename: string): Promise<string> {
  await fs.promises.writeFile(`./${filename}`, md5List.join("\n"));
  return filename;
}

export async function createMD5ListFile(md5List: string[], filename?: string) {
  return writeMD5ListFile(
    md5List,
    filename ?? `libgen_downloader_md5_list_${Date.now().toString()}.txt`
  );
}

export async function createFailedMD5ListFile(md5List: string[], filename?: string) {
  return writeMD5ListFile(
    md5List,
    filename ?? `libgen_downloader_failed_md5_list_${Date.now().toString()}.txt`
  );
}

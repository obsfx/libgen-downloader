import fs from "fs";

export async function createMD5ListFile(md5List: string[]) {
  const filename = `libgen_downloader_md5_list_${Date.now().toString()}.txt`;
  await fs.promises.writeFile(`./${filename}`, md5List.join("\n"));
  return filename;
}

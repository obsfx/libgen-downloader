import fs from "fs";

export async function createMD5ListFile(md5List: string[]) {
  const filename = `MD5_LIST_${Date.now().toString()}.txt`;
  await fs.promises.writeFile(`./${filename}`, md5List.join("\n"));
  return filename;
}

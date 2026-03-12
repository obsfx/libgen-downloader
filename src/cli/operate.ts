import { readMD5List, runDownloadCommand, runSearchCommand, runURLCommand } from "./non-interactive";
import renderTUI from "../tui/index";

export const operate = async (flags: Record<string, unknown>) => {
  if (flags.search) {
    const query = flags.search as string;
    if (query.length < 3) {
      console.log("Query must be at least 3 characters long");
      return;
    }

    await runSearchCommand(query, flags);
    return;
  }

  if (flags.bulk) {
    const filePath = flags.bulk as string;
    const md5List = await readMD5List(filePath);
    await runDownloadCommand(md5List, flags);
    return;
  }

  if (flags.url) {
    const md5 = flags.url as string;
    await runURLCommand(md5, flags);

    return;
  }

  if (flags.download) {
    const md5 = flags.download as string;
    await runDownloadCommand([md5], flags);
    return;
  }

  renderTUI({
    startInCLIMode: false,
    doNotFetchConfigInitially: false,
  });
};

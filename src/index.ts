import { cli } from "./cli/index.js";
import { operate } from "./cli/operate.js";
export const APP_VERSION = cli.pkg.version;
operate(cli.flags);

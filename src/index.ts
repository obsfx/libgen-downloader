import { cli } from "./cli/index";
import { operate } from "./cli/operate";
export const APP_VERSION = cli.pkg.version;
operate(cli.flags);

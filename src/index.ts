import { cli } from "./cli";
import { operate } from "./cli/operate";
import { version } from "../package.json";
export const APP_VERSION = version;
operate(cli.flags);

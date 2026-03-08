import { cli } from "./cli";
import { operate } from "./cli/operate";


operate(cli.flags);

export {version as APP_VERSION} from "../package.json";
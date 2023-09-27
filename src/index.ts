import { cli } from "./cli/index.js";
import renderTUI from "./tui/index.js";

export const { input, flags, pkg } = cli;

//console.log(cli);
renderTUI();

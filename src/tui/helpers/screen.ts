export const clearScreen = () => {
  let clearANSI = "\u001B[2J";
  if (process.platform === "win32") {
    clearANSI = "u001b[H\u001Bc";
  }
  // reset screen pos
  process.stdout.write("\u001B[1;1H");
  // clear screen
  process.stdout.write(clearANSI);
};

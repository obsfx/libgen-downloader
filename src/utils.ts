export const clearTerminal = (): void => {
  const clearANSI: string = process.platform === 'win32' ?
  'u001b[H\u001bc' :
  '\u001b[2J';

  // clear screen
  process.stdout.write(clearANSI);
  // reset screen pos
  process.stdout.write('\u001b[1;1H');
}

import React from 'react';
import { render } from 'ink';
import App from './components/App';

const clearTerminal = (): void => {
  const clearANSI: string = process.platform === 'win32' ?
  'u001b[H\u001bc' :
  '\u001b[2J';

  // reset screen pos
  process.stdout.write('\u001b[1;1H');
  // clear screen
  process.stdout.write(clearANSI);
}

export const init = () => {
  clearTerminal();
  render(<App />)
}


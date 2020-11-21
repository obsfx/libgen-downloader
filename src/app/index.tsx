import React from 'react';
import { render } from 'ink';
import { base_app_width } from './app-config.json';
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

const adjustWidth = (width: number) => width > base_app_width ? base_app_width : width;

export const init = () => {
  clearTerminal();
  let unmount = render(<App appWidth={adjustWidth(process.stdout.columns)}/>).unmount;

  process.stdout.on('resize', () => {
    unmount();
    clearTerminal();
    unmount = render(<App appWidth={adjustWidth(process.stdout.columns)}/>).unmount;
  });
}

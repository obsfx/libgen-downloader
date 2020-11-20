import React from 'react';
import { render } from 'ink';
import App from './components/App';
import { clearTerminal } from '../utils';

export const init = () => {
  clearTerminal();
  let clear = render(<App appWidth={process.stdout.columns}/>).unmount;
  process.stdout.on('resize', () => {
    clear();
    clearTerminal();
    clear = render(<App appWidth={process.stdout.columns}/>).unmount;
  });
}

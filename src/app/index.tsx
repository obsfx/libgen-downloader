import React from 'react';
import { render } from 'ink';
import App from './components/App';
import { clearTerminal } from '../utils';

export const init = () => {
  clearTerminal();
  render(<App />);
}

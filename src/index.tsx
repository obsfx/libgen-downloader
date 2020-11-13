import React from 'react';
import { render } from 'ink';
import { version } from '../package.json';
import App from './components/App';

const clear: string = process.platform === 'win32' ?
'u001b[H\u001bc' :
'\u001b[2J';

// clear screen
process.stdout.write(clear);
// reset screen pos
process.stdout.write('\u001b[1;1H');

render(<App version={version}/>);

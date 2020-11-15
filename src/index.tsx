import React from 'react';
import { render } from 'ink';
import App from './components/App';
import fetch from 'node-fetch';
import config from './config.json';

const a = async () => {
  try {
    let a = config.MIRRORS[2];
    const res = await fetch(a);
    console.log(res.redirected, res.status, 'success', a);
  } catch(e) {
    console.log('error');
  }
}

a();


//render(<App />);

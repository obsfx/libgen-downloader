import React from 'react';
import { render } from 'ink';
import App from './components/App';
import fetch from 'node-fetch';
import config from './config.json';

import { search } from './search-api';

const k = async () => {
  let p = await search(config.MIRRORS[1], 'javascript the good parts', 2);
  if (p) 
  console.log(p);
}

//k();

//const a = async () => {
//  try {
//    let a = config.MIRRORS[2];
//    const res = await fetch(a);
//    console.log(res.redirected, res.status, 'success', a);
//  } catch(e) {
//    console.log('error');
//  }
//}
//
//a();


render(<App />);

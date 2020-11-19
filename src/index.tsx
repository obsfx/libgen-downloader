import React from 'react';
import { render } from 'ink';
import App from './components/App';

//const k = async () => {
//  let p = await search(config.searchReqPattern, config.mirrors[1], 'javascript the good parts', 2, 25);
//  if (p) 
//  console.log(p);
//}
//
//const z = async () => {
//  let p = await fetch('https://raw.githubusercontent.com/obsfx/libgen-downloader/configuration/config.json');
//  console.log(await p.json());
//}

//z();

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

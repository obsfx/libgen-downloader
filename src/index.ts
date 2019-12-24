import inquirer from 'inquirer';
import fetch from 'node-fetch';
import jsdom, { JSDOM } from 'jsdom';

import questions from './questions';
import selectors from './selectors';

const prompt: inquirer.PromptModule = inquirer.createPromptModule();

const main = async () => {

    // let answers : any = await prompt([
    //     questions.QSearch
    // ]);

    // console.log(answers);

    let data: any;

    try {
        data = await fetch('http://libgen.is/search.php?req=Doing%20Math%20with%20Python%3A+Use+Programming+to+Explore+Algebra%2C+Statistics%2C+Calculus%2C+and+More%21&lg_topic=libgen&open=0&view=simple&res=25&phrase=1&column=def');

        data = await data.text();
        let doc: jsdom.JSDOM = new JSDOM(data);
        // console.log(doc.window.document.querySelectorAll(".c tbody tr"));
        // doc.window.document.querySelectorAll(".c tbody tr").forEach(e => {
        //     console.log(e.children[0].children[0].textContent);
        // })
        console.log(selectors.THeads.ID)
        console.log(doc.window.document.querySelector(selectors.THeads.ID)?.textContent);
        console.log(doc.window.document.querySelector(selectors.THeads.Author)?.textContent);
        console.log(doc.window.document.querySelector(selectors.THeads.Ext)?.textContent);
        console.log(doc.window.document.querySelector(selectors.THeads.Lang)?.textContent);
        console.log(doc.window.document.querySelector(selectors.THeads.Mirror)?.textContent);
        console.log(doc.window.document.querySelector(selectors.THeads.Pages)?.textContent);
        console.log(doc.window.document.querySelector(selectors.THeads.Publisher)?.textContent);
        console.log(doc.window.document.querySelector(selectors.THeads.Size)?.textContent);
    } catch(err) {
        console.log(err);
    }
}

main();

// prompt([{
//     type: "checkbox",
//     name: "test",
//     message: "Selam naber",
//     choices: [
//         {
//             name: "deneme",
//             value: "Secenek A"
//         }, 
//         {
//             name: "denemeB",
//             value: "Secenek B"
//         }, 
//         {
//             name: "denemeC",
//             value: "Secenek C"
//         }, 
//         {
//             name: "denemeD",
//             value: "Secenek D"
//         }, 
//     ]
// }])
// .then(answers => {
//     console.log(answers);
// });
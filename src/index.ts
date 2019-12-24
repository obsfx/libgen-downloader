import inquirer from 'inquirer';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

import questions from './questions';
import selectors from './selectors';
import { getAllEntries } from './entries';

const prompt: inquirer.PromptModule = inquirer.createPromptModule();

const main = async () => {

    let answers : any = await prompt([
        questions.QSearch
    ]);

    console.log(answers);

    try {
        const url = `http://libgen.is/search.php?req=${answers.qsearch}&lg_topic=libgen&open=0&view=simple&res=25&phrase=1&column=def`;

        let data: any = await fetch(url);
        data = await data.text();

        const document: HTMLDocument = new JSDOM(data).window.document;
        const entiries = getAllEntries(document);

        // console.log(entiries);

        const q = questions.getListQuestion(entiries);

        let a = prompt(q);

        // let doc: jsdom.JSDOM = new JSDOM(data);
        // console.log(doc.window.document.querySelectorAll(".c tbody tr"));
        // doc.window.document.querySelectorAll(".c tbody tr").forEach(e => {
        //     console.log(e.children[0].children[0].textContent);
        // })
        // console.log(selectors.getEntryData(2).ID);
        // console.log(doc.window.document.querySelector(selectors.THeads.ID)?.textContent);
        // console.log(doc.window.document.querySelector(selectors.THeads.Author)?.textContent);
        // console.log(doc.window.document.querySelector(selectors.THeads.Ext)?.textContent);
        // console.log(doc.window.document.querySelector(selectors.THeads.Lang)?.textContent);
        // console.log(doc.window.document.querySelector(selectors.THeads.Mirror)?.textContent);
        // console.log(doc.window.document.querySelector(selectors.THeads.Pages)?.textContent);
        // console.log(doc.window.document.querySelector(selectors.THeads.Publisher)?.textContent);
        // console.log(doc.window.document.querySelector(selectors.THeads.Size)?.textContent);
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
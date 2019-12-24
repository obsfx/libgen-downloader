import inquirer from 'inquirer';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { Spinner } from 'cli-spinner';

import questions from './questions';
import selectors from './selectors';
import { getAllEntries } from './entries';

const prompt: inquirer.PromptModule = inquirer.createPromptModule();

const main = async () => {
    console.log("libgen-downloader");

    let spinner = new Spinner('Searching.. %s ');
    spinner.setSpinnerString('|/-\\');

    let input: any = await prompt([
        questions.QSearch
    ]);

    // console.log(answers);
    spinner.start();
    try {
        const url = `http://libgen.is/search.php?req=${input.qsearch}&lg_topic=libgen&open=0&view=simple&res=100&phrase=1&column=def`;

        let data: any = await fetch(url);
        data = await data.text();

        const document: HTMLDocument = new JSDOM(data).window.document;
        const entiries = getAllEntries(document);

        // console.log(entiries);
        if (entiries.length != 0) {
            const listQuestion = questions.getListQuestion(entiries);
            spinner.stop();
            console.log("");
            let selection = await prompt(listQuestion);
        } else {
            spinner.stop();
            console.log("");
            console.log("No Result");
        }

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
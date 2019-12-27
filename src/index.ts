import inquirer from 'inquirer';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { Spinner } from 'cli-spinner';

import questions from './questions';
import { getAllEntries } from './entries';
import { getPaginations } from './pagination';
import { getUrl } from './url';
import { IQuestionChoice, IListQuestion } from './interfaces';

const main = async () => {

    /* 
        TODO:
        ->  More polished outputs
    */

    console.log("libgen-downloader");
    console.log("obsfx.github.io");

    let currentPage: number = 1;

    const prompt: inquirer.PromptModule = inquirer.createPromptModule();

    let spinner = new Spinner('Searching.. %s ');
    spinner.setSpinnerString('|/-\\');

    let input: any = await prompt([
        questions.QSearch
    ]);

    // console.log(answers);
    spinner.start();

    /*
        TODO:
        ->  [DONE] URL Builder
        ->  Page Counter
    */
    try {
        // const url = `http://libgen.is/search.php?req=${input.searchInput}&lg_topic=libgen&open=0&view=simple&res=50&phrase=1&column=def`;
        const url = getUrl(input.searchInput, currentPage);
        
        console.log(url);
        let response: any = await fetch(url);
        let plainText: any = await response.text();

        const document: HTMLDocument = new JSDOM(plainText).window.document;

        let { isNextPageExist, entiries } = getAllEntries(document);
        // let paginations: any = getPaginations(document) || false;

        // console.log("----" + paginations);
        // console.log(entiries);

        if (entiries.length != 0) {
            let listQuestion: IListQuestion = questions.getListQuestion(entiries);
            let paginationQuestionChoices: IQuestionChoice[] = getPaginations(input.searchInput, currentPage, isNextPageExist);

            listQuestion.choices = paginationQuestionChoices.concat(listQuestion.choices)
            console.log(listQuestion.choices, paginationQuestionChoices, isNextPageExist);
            spinner.stop(true);

            let selection = await prompt(listQuestion);

            console.log(selection);
        } else {
            spinner.stop(true);
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
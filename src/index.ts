import inquirer from 'inquirer';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { Spinner } from 'cli-spinner';

import questions from './questions';
import entries from './entries';
import { getPaginations } from './pagination';
import { getUrl } from './url';
import { IQuestionChoice, IListQuestion, IListQuestionResult, IListEntryDetailsQuestionResult } from './interfaces';

let currentPage: number = 1;

const prompt: inquirer.PromptModule = inquirer.createPromptModule();
const spinner = new Spinner('Searching.. %s ');
spinner.setSpinnerString('|/-\\');

const showResults = async (pageUrl: string, query: string, pageNumber: number) => {
    spinner.start();

    let { plainText, error }: any = await getResponse(pageUrl);

    if (error) {
        console.log(error);
        return 1;
    }

    const document: HTMLDocument = new JSDOM(plainText).window.document;

    let { isNextPageExist, entiries } = entries.getAllEntries(document);

    if (entiries.length != 0) {
        let listQuestion: IListQuestion = questions.getListQuestion(entiries);
        let paginationQuestionChoices: IQuestionChoice[] = getPaginations(query, pageNumber, isNextPageExist);

        listQuestion.choices = paginationQuestionChoices.concat(listQuestion.choices)
        spinner.stop(true);

        let selected: IListQuestionResult = await prompt(listQuestion);

        if (selected.result.pagination) {
            currentPage = (selected.result.pagination == 'next') ? currentPage + 1 : currentPage - 1;
            await showResults(selected.result.url, query, currentPage);
        } else {
            console.log(selected);
            entries.showEntry(entiries[Number(selected.result.id)]);

            let detailsQuestion: IListQuestion = questions.getEntryDetailsQuestion(pageUrl, '');

            let selectedOption: IListEntryDetailsQuestionResult = await prompt(detailsQuestion);

            if (selectedOption.result.download) {

            } else {
                await showResults(selectedOption.result.url, query, currentPage);
            }
        }

        // console.log(selection);
    } else {
        spinner.stop(true);
        console.log("No Result");
    }
}

const getResponse = async (pageUrl: string): Promise<{ plainText: string, error: any }> => {
    let plainText: any = "";
    let error: boolean = false;

    try {
        let response = await fetch(pageUrl);
        plainText = await response.text();
    } catch(err) {
        error = err;
    }

    return { plainText, error }
}

const main = async () => {

    /* 
        TODO:
        ->  More polished outputs
    */

    console.log("libgen-downloader");
    console.log("obsfx.github.io");

    let input: any = await prompt([
        questions.QSearch
    ]);

    const url = getUrl(input.searchInput, currentPage);
    console.log(url);

    await showResults(url, input.searchInput, currentPage);
}

main();
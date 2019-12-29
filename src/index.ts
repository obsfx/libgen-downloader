import events from 'events';
import fs from 'fs';

import inquirer from 'inquirer';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { Spinner } from 'cli-spinner';
import ProgressBar from 'progress';

import questions from './questions';
import entries from './entries';
import { getPaginations } from './pagination';
import { getUrl } from './url';
import { 
    IQuestionChoice, 
    IListQuestion, 
    IListQuestionResult, 
    IListEntryDetailsQuestionResult, 
    IAppState,
    IInputQuestionResult,
    IEntry
} from './interfaces';

let appState: IAppState = {
    currentPage: 1,
    url: '',
    query: '',
    isNextPageExist: false,
    entryDataArr : [],
    listQuestion: []
}

const prompt: inquirer.PromptModule = inquirer.createPromptModule();
const spinner = new Spinner();
spinner.setSpinnerString('|/-\\');

const eventEmitter = new events.EventEmitter();
eventEmitter.on('userSelectedOnList', async (selected: IListQuestionResult) => {
    if (selected.result.pagination) {
        appState.currentPage = (selected.result.pagination == 'next') ? 
        appState.currentPage + 1 : 
        appState.currentPage - 1;

        await getResults();
        await promptResults();
    } else {
        await promptDetails(selected.result.id);
    }
});

eventEmitter.on('userSelectedOnDetails', async (selected: IListEntryDetailsQuestionResult) => {
    if (selected.result.download) {
        await downloadMedia(selected.result.id);
    } else {
        await promptResults();
    }
});

const getResponse = async (pageUrl: string): Promise<{ response: any, error: any }> => {
    let response: any = "";
    let error: boolean = false;

    try {
        response = await fetch(pageUrl);
    } catch(err) {
        error = err;
    }

    return { response, error }
}

const getDocument = async (pageUrl: string): Promise<HTMLDocument> => {
    let { response, error }: { response: any, error: any } = await getResponse(pageUrl);

    if (error) {
        console.log(error);
        return new HTMLDocument();
    }

    let plainText = await response.text();

    const document: HTMLDocument = new JSDOM(plainText).window.document;

    return document;
}

const getResults = async (): Promise<void | number> => {
    spinner.setSpinnerTitle('Getting Results... %s');
    spinner.start();

    appState.url = getUrl(appState.query, appState.currentPage);
    console.log(appState.url);

    const document: HTMLDocument = await getDocument(appState.url);

    let { isNextPageExist, entryDataArr } = entries.getAllEntries(document);

    appState.isNextPageExist = isNextPageExist;
    appState.entryDataArr = entryDataArr;
}

const promptResults = async (): Promise<void> => {
    if (appState.entryDataArr.length != 0) {
        let listQuestion: IListQuestion = questions.getListQuestion(appState.entryDataArr, appState.currentPage);
        let paginationQuestionChoices: IQuestionChoice[] = getPaginations(appState.query, appState.currentPage, appState.isNextPageExist);

        listQuestion.choices = paginationQuestionChoices.concat(listQuestion.choices);
        appState.listQuestion = listQuestion;
        spinner.stop(true);

        let selected: IListQuestionResult = await prompt(appState.listQuestion);

        eventEmitter.emit('userSelectedOnList', selected);
    } else {
        spinner.stop(true);
        console.log("No Result");
    }
}

const promptDetails = async (entryID: string): Promise<void> => {
    let selectedEntry: IEntry = appState.entryDataArr[Number(entryID)];
    let textArr: string[] = entries.getDetails(selectedEntry);

    textArr.forEach(data => console.log(data));

    let detailsQuestion: IListQuestion = questions.getEntryDetailsQuestion(appState.url, entryID);

    let selectedOption: IListEntryDetailsQuestionResult = await prompt(detailsQuestion);

    eventEmitter.emit('userSelectedOnDetails', selectedOption);
}

const downloadMedia = async (entryID: string) => {
    spinner.setSpinnerTitle('Downloading... %s');
    spinner.start();

    let selectedEntry: IEntry = appState.entryDataArr[Number(entryID)];
    console.log(selectedEntry.Mirror);

    const URLParts: string[] = selectedEntry.Mirror.split('/');
    const document: HTMLDocument = await getDocument(selectedEntry.Mirror);

    let downloadUrl: string = entries.getDownloadURL(document);

    downloadUrl = `${URLParts[0]}//${URLParts[2]}${downloadUrl}`;

    console.log(selectedEntry);
    console.log(downloadUrl);

    let { response, error }: { response: any, error: any } = await getResponse(downloadUrl);

    const fileName = `${selectedEntry.ID}_${selectedEntry.Title}`;
    const fileExtension = downloadUrl.split('.').pop();

    const file = fs.createWriteStream(`./${fileName}.${fileExtension}`);

    const progressBar = new ProgressBar('-> Downloading [:bar] :percent :etas', {
        width: 40,
        complete: '=',
        incomplete: ' ',
        renderThrottle: 1,
        total: parseInt(response.headers.get('content-length'))
    });
  

    response.body.on('data', (chunk: any) => progressBar.tick(chunk.length));
    response.body.pipe(file);

    spinner.stop(true);
}

const main = async (): Promise<void> => {

    /* 
        TODO:
        ->  More polished outputs
    */

    console.log("libgen-downloader");
    console.log("obsfx.github.io");

    let input: IInputQuestionResult = await prompt([
        questions.SearchQuestion
    ]);

    appState.query = input.result;

    await getResults();
    await promptResults();
}

main();
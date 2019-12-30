"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
const fs_1 = __importDefault(require("fs"));
const readline_1 = __importDefault(require("readline"));
const inquirer_1 = __importDefault(require("inquirer"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const jsdom_1 = require("jsdom");
const cli_spinner_1 = require("cli-spinner");
const progress_1 = __importDefault(require("progress"));
const kleur_1 = require("kleur");
const questions_1 = __importDefault(require("./questions"));
const entries_1 = __importDefault(require("./entries"));
const selectors_1 = require("./selectors");
const pagination_1 = require("./pagination");
const url_1 = require("./url");
let appState;
const prompt = inquirer_1.default.createPromptModule();
const spinner = new cli_spinner_1.Spinner();
spinner.setSpinnerString('|/-\\');
const eventEmitter = new events_1.default.EventEmitter();
eventEmitter.on('userSelectedOnList', (selected) => __awaiter(void 0, void 0, void 0, function* () {
    if (selected.result.pagination) {
        appState.currentPage = (selected.result.pagination == 'next') ?
            appState.currentPage + 1 :
            appState.currentPage - 1;
        yield getAndPromptResults();
    }
    else if (selected.result.id == 'searchAgain') {
        yield getInput();
    }
    else if (selected.result.id == 'exit') {
        process.exit(0);
    }
    else {
        yield promptDetails(selected.result.id);
    }
}));
eventEmitter.on('userSelectedOnDetails', (selected) => __awaiter(void 0, void 0, void 0, function* () {
    if (selected.result.download) {
        yield downloadMedia(selected.result.id);
    }
    else {
        readline_1.default.cursorTo(process.stdout, 0, 4);
        readline_1.default.clearScreenDown(process.stdout);
        yield promptResults();
    }
}));
const connectionError = () => {
    if (spinner.isSpinning()) {
        spinner.stop(true);
    }
    console.log(`${kleur_1.red().bold('Connection Error.')} Probably libgen servers are not currently available. Please try again after a while.`);
    process.exit(1);
};
const isSearchInputExist = (document) => {
    const searchInput = document.querySelector(selectors_1.CSS_Selectors.SEARCH_INPUT);
    return (searchInput) ? true : false;
};
const isNextPageExist = () => __awaiter(void 0, void 0, void 0, function* () {
    const nextPageUrl = url_1.getUrl(appState.query, appState.currentPage + 1);
    const document = yield getDocument(nextPageUrl);
    let entryAmount = document.querySelectorAll(`${selectors_1.CSS_Selectors.TABLE_CONTAINER} tr`).length;
    return (entryAmount > 1) ? true : false;
});
const getResponse = (pageUrl) => __awaiter(void 0, void 0, void 0, function* () {
    let response = "";
    try {
        response = yield node_fetch_1.default(pageUrl);
    }
    catch (err) {
        appState.connectionError = true;
    }
    return response;
});
const getDocument = (pageUrl) => __awaiter(void 0, void 0, void 0, function* () {
    let response = yield getResponse(pageUrl);
    if (appState.connectionError) {
        connectionError();
        return new HTMLDocument();
    }
    let plainText = yield response.text();
    const document = new jsdom_1.JSDOM(plainText).window.document;
    return document;
});
const getResults = () => __awaiter(void 0, void 0, void 0, function* () {
    spinner.setSpinnerTitle(`${kleur_1.cyan().bold('Getting Results')}... %s`);
    spinner.start();
    appState.url = url_1.getUrl(appState.query, appState.currentPage);
    const document = yield getDocument(appState.url);
    if (!isSearchInputExist(document)) {
        appState.connectionError = true;
        return void 0;
    }
    let entryDataArr = entries_1.default.getAllEntries(document);
    appState.isNextPageExist = yield isNextPageExist();
    appState.entryDataArr = entryDataArr;
});
const promptResults = () => __awaiter(void 0, void 0, void 0, function* () {
    if (appState.entryDataArr.length != 0) {
        let listQuestion = questions_1.default.getListQuestion(appState.entryDataArr, appState.currentPage);
        let paginationQuestionChoices = pagination_1.getPaginations(appState.query, appState.currentPage, appState.isNextPageExist);
        listQuestion.choices = paginationQuestionChoices.concat(listQuestion.choices);
        appState.listQuestion = listQuestion;
        spinner.stop(true);
        let selected = yield prompt(appState.listQuestion);
        eventEmitter.emit('userSelectedOnList', selected);
    }
    else {
        spinner.stop(true);
        console.log(`${kleur_1.cyan().bold('No Result.')}`);
    }
});
const getAndPromptResults = () => __awaiter(void 0, void 0, void 0, function* () {
    appState.connectionError = false;
    yield getResults();
    if (!appState.connectionError) {
        yield promptResults();
    }
    else {
        connectionError();
    }
});
const promptDetails = (entryID) => __awaiter(void 0, void 0, void 0, function* () {
    let selectedEntry = appState.entryDataArr[Number(entryID)];
    let textArr = entries_1.default.getDetails(selectedEntry);
    textArr.forEach(data => console.log(data));
    let detailsQuestion = questions_1.default.getEntryDetailsQuestion(appState.url, entryID);
    let selectedOption = yield prompt(detailsQuestion);
    eventEmitter.emit('userSelectedOnDetails', selectedOption);
});
const downloadMedia = (entryID) => __awaiter(void 0, void 0, void 0, function* () {
    spinner.setSpinnerTitle(`${kleur_1.cyan().bold('Connecting to Mirror')}... %s`);
    spinner.start();
    let selectedEntry = appState.entryDataArr[Number(entryID)];
    const URLParts = selectedEntry.Mirror.split('/');
    const document = yield getDocument(selectedEntry.Mirror);
    if (appState.connectionError) {
        connectionError();
        return void 0;
    }
    let downloadUrl = entries_1.default.getDownloadURL(document);
    downloadUrl = `${URLParts[0]}//${URLParts[2]}${downloadUrl}`;
    let response = yield getResponse(downloadUrl);
    if (appState.connectionError) {
        connectionError();
        return void 0;
    }
    const fileName = selectedEntry.Title.split(' ').join('_');
    const fileExtension = selectedEntry.Ext;
    const file = fs_1.default.createWriteStream(`./${fileName}.${fileExtension}`);
    const progressBar = new progress_1.default(`${kleur_1.green().bold('-> Downloading')} [:bar] :percent :current`, {
        width: 40,
        complete: '=',
        incomplete: '.',
        renderThrottle: 1,
        total: parseInt(response.headers.get('content-length'))
    });
    spinner.stop(true);
    response.body.on('data', (chunk) => progressBar.tick(chunk.length));
    response.body.on('error', () => connectionError());
    response.body.on('finish', () => console.log(`${kleur_1.green().bold('DONE')} ${kleur_1.yellow().bold(`${fileName}.${fileExtension}`)} downloaded on working directory.`));
    response.body.pipe(file);
});
const getInput = () => __awaiter(void 0, void 0, void 0, function* () {
    appState = {
        currentPage: 1,
        url: '',
        query: '',
        isNextPageExist: false,
        connectionError: false,
        entryDataArr: [],
        listQuestion: []
    };
    let input = yield prompt([
        questions_1.default.SearchQuestion
    ]);
    appState.query = input.result;
    yield getAndPromptResults();
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    /*
        TODO:
        ->  More polished outputs
        next page error - done
        error handlings
    */
    readline_1.default.cursorTo(process.stdout, 0, 0);
    readline_1.default.clearScreenDown(process.stdout);
    console.log(`${kleur_1.yellow().bold('libgen-downloader')} - ${kleur_1.yellow().bold('0.1.0')}`);
    console.log(`${kleur_1.cyan().bold('https://github.com/obsfx/libgen-cli-downloader')} - ${kleur_1.cyan().bold('obsfx')}`);
    console.log('---------------------------------------------');
    yield getInput();
});
main();

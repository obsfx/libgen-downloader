"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config"));
const SearchQuestion = {
    type: "input",
    name: "result",
    message: "Search: "
};
const getQuestionChoice = (name, value) => {
    return {
        name,
        value
    };
};
const getQuestionChoices = (entries, pageNumber) => {
    let choices = [];
    choices = entries.map((e, i) => {
        let title = `<${((pageNumber - 1) * config_1.default.RESULTS_PAGE_SIZE) + i + 1}> <${e.Ext}> ${e.Title}`;
        if (title.length > config_1.default.TITLE_MAX_STRLEN) {
            title = title.substr(0, config_1.default.TITLE_MAX_STRLEN) + "...";
        }
        return getQuestionChoice(title, { pagination: false, id: `${i}`, url: '' });
    });
    return choices.slice(0, config_1.default.RESULTS_PAGE_SIZE);
};
const getListQuestion = (entries, pageNumber) => {
    return {
        type: 'list',
        message: `Page: ${pageNumber} Results: `,
        name: 'result',
        pageSize: config_1.default.INQUIRER_PAGE_SIZE,
        choices: getQuestionChoices(entries, pageNumber)
    };
};
const getEntryDetailsQuestionChoice = (listUrl, entryID) => {
    let choices = [];
    choices.push(getQuestionChoice('<- Turn Back To The List', {
        download: false,
        id: entryID
    }));
    choices.push(getQuestionChoice('>> Download This Media', {
        download: true,
        id: entryID
    }));
    return choices;
};
const getEntryDetailsQuestion = (listUrl, entryID) => {
    return {
        type: 'list',
        message: 'Options: ',
        name: 'result',
        pageSize: 2,
        choices: getEntryDetailsQuestionChoice(listUrl, entryID)
    };
};
exports.default = {
    SearchQuestion,
    getQuestionChoice,
    getListQuestion,
    getEntryDetailsQuestion
};

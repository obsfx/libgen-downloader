import config from './config';

import { Interfaces } from './interfaces.namespace';

const SearchQuestion: Interfaces.InputQuestion = {
    type: "input",
    name: "result",
    message: "Search: "
}

const getQuestionChoice = (
        name: string, 
        value: Interfaces.ListQuestionChoiceResult | Interfaces.EntryDetailsQuestionChoiceResult
    ): Interfaces.QuestionChoice => {

    return {
        name,
        value
    }
} 

const getQuestionChoices = (
        entries: Interfaces.Entry[], 
        pageNumber: number
    ): Interfaces.QuestionChoice[] => {

    let choices: Interfaces.QuestionChoice[] = [];

    choices = entries.map((e, i) => {
        let title = `<${((pageNumber - 1) * config.RESULTS_PAGE_SIZE) + i + 1}> <${e.Ext}> ${e.Title}`;

        if (title.length > config.TITLE_MAX_STRLEN) {
            title = title.substr(0, config.TITLE_MAX_STRLEN) + "...";
        }

        return getQuestionChoice(title, { pagination: false, id: `${i}`, url: '' });
    });

    return choices.slice(0, config.RESULTS_PAGE_SIZE);
}

const getListQuestion = (
        entries: Interfaces.Entry[], 
        pageNumber: number
    ): Interfaces.ListQuestion => {

    return {
        type: 'list',
        message: `Page: ${pageNumber} Results: `,
        name: 'result',
        pageSize: config.INQUIRER_PAGE_SIZE,
        choices: getQuestionChoices(entries, pageNumber)
    }
}

const getEntryDetailsQuestionChoice = (
        entryID: string
    ): Interfaces.QuestionChoice[] => {
        
    let choices: Interfaces.QuestionChoice[] = [];

    choices.push(
        getQuestionChoice('<- Turn Back To The List', {
            download: false, 
            id: entryID 
    }));

    choices.push(
        getQuestionChoice('>> Download This Media', {
            download: true, 
            id: entryID 
    }));

    return choices;
}

const getEntryDetailsQuestion = (entryID: string): Interfaces.ListQuestion => {
    return {
        type: 'list',
        message: 'Options: ',
        name: 'result',
        pageSize: 2,
        choices: getEntryDetailsQuestionChoice(entryID)
    }
}

export default {
    SearchQuestion;
}
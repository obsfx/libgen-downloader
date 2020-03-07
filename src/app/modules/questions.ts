import CONFIG from '../config';
import CONSTANTS from '../constants';

import { Interfaces } from '../interfaces.namespace';

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
        let title = `[${((pageNumber - 1) * CONFIG.RESULTS_PAGE_SIZE) + i + 1}] [${e.Ext}] ${e.Title}`;

        if (title.length > CONFIG.TITLE_MAX_STRLEN) {
            title = title.substr(0, CONFIG.TITLE_MAX_STRLEN) + "...";
        }

        return getQuestionChoice(title, { pagination: false, id: `${i}`, url: '' });
    });

    return choices.slice(0, CONFIG.RESULTS_PAGE_SIZE);
}

const getListQuestion = (
        entries: Interfaces.Entry[], 
        pageNumber: number
    ): Interfaces.ListQuestion => {

    return {
        type: 'list',
        message: `Page: ${pageNumber} Results: `,
        name: 'result',
        pageSize: CONFIG.INQUIRER_PAGE_SIZE,
        choices: getQuestionChoices(entries, pageNumber)
    }
}

const getEntryDetailsQuestionChoice = (
        entryIndex: string
    ): Interfaces.QuestionChoice[] => {
        
    let choices: Interfaces.QuestionChoice[] = [];

    choices.push(
        getQuestionChoice(CONSTANTS.ENTRY_DETAILS_QUESTIONS.TURN_BACK, {
            download: false, 
            id: '' 
    }));

    choices.push(
        getQuestionChoice(CONSTANTS.ENTRY_DETAILS_QUESTIONS.DOWNLOAD_MEDIA, {
            download: true,
            id: entryIndex
    }));

    return choices;
}

const getEntryDetailsQuestion = (entryIndex: number): Interfaces.ListQuestion => {
    return {
        type: 'list',
        message: 'Options: ',
        name: 'result',
        pageSize: 2,
        choices: getEntryDetailsQuestionChoice(entryIndex.toString())
    }
}

const getAfterEventQuestionChoices = (options: Interfaces.AfterEventQuetionOption[]): Interfaces.QuestionChoice[] => {
    let choices: Interfaces.QuestionChoice[] = [];

    for (let i: number = 0; i < options.length; i++) {
        choices.push(
            getQuestionChoice(
                options[i].name,
                {
                    download: false,
                    id: options[i].id
                }
            )
        );
    }

//    choices.push(
//        getQuestionChoice(
//            CONSTANTS.AFTER_DOWNLOAD_QUESTIONS.TURN_BACK, 
//            {
//                download: false,
//                id: CONSTANTS.AFTER_DOWNLOAD_QUESTIONS.TURN_BACK_RESULT_ID
//            }
//        )
//    );
//
//    choices.push(
//        getQuestionChoice(
//            CONSTANTS.AFTER_DOWNLOAD_QUESTIONS.EXIT,
//            {
//                download: false,
//                id: CONSTANTS.AFTER_DOWNLOAD_QUESTIONS.EXIT_RESULT_ID
//            }
//        )
//    );

    return choices
}

const getAfterEventQuestion = (options: Interfaces.AfterEventQuetionOption[]): Interfaces.ListQuestion => {
    return {
        type: 'list',
        message: 'Options: ',
        name: 'result',
        pageSize: options.length,
        choices: getAfterEventQuestionChoices(options)
    }
}

export default {
    SearchQuestion,
    getListQuestion,
    getQuestionChoice,
    getEntryDetailsQuestion,
    getAfterEventQuestion
}

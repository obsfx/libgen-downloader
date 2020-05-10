import CONFIG from '../config';
import CONSTANTS from '../constants';

import { Interfaces } from '../interfaces.namespace';
import { UIInterfaces } from '../../ui';

export default abstract class {
    private static buildTitle(title: string, ext: string, pageNumber: number, index: number): string {
        let orderNumber: string = `[${ (pageNumber - 1) * CONFIG.RESULTS_PAGE_SIZE + index + 1 }]`;

        if (index < 9) {
            orderNumber += ' ';
        }

        let titleBody: string = ` [${ext}] ${title}`;
        
        return `${orderNumber}${titleBody}`;
    }

    public static getListObject(entries: Interfaces.Entry[], pageNumber: number): UIInterfaces.ListObject {
        return {
            type: 'list',
            listedItemCount: CONFIG.UI_PAGE_SIZE,
            listings: this.getListingObjectArr(entries, pageNumber)
        }
    }

    public static getListingObjectArr(
        entries: Interfaces.Entry[], 
        pageNumber: number): UIInterfaces.ListingObject[] {

        let listingObjects: UIInterfaces.ListingObject[];

        listingObjects = entries.map((e: Interfaces.Entry, i: number) => {
            let title: string = this.buildTitle(e.Title, e.Ext, pageNumber, i);

            if (title.length > CONFIG.TITLE_MAX_STRLEN) {
                title = title.substr(0, CONFIG.TITLE_MAX_STRLEN - 3) + '...';
            }

            return this.getEntryListingObject(title, i, e.ID);
        });

        return listingObjects;
    }

    public static getEntryListingObject(title: string, index: number, id: string): UIInterfaces.ListingObject {
        return {
            text: title,
            value: index.toString(),
            
            submenu: [
                {
                    text: 'Download Directly',
                    actionID: CONSTANTS.DOWNLOAD_RES_VAL,
                    value: id,
                    isSubmenuListing: true,
                    isCheckable: false
                }
            ],

            isSubmenuListing: false,
            isSubmenuOpen: false,
            isCheckable: true,
            checkBtnText: 'Add To Bulk Download Queue',
            unCheckBtnText: 'Remove From Bulk Download Queue',
            submenuToggleBtnText: 'Close The Sublist'
        }
    }

    public static getOptionListingObject(title: string, actionID: string, val: string = ''): UIInterfaces.ListingObject {
        return {
            text: title,
            value: val,
            actionID: actionID,
            isSubmenuListing: false,
            isCheckable: false
        }
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

// export default {
//     SearchQuestion,
//     getListQuestion,
//     getQuestionChoice,
//     getEntryDetailsQuestion,
//     getAfterEventQuestion
// }

import CONFIG from '../config';
import CONSTANTS from '../constants';

import { Interfaces } from '../interfaces.namespace';
import { UIInterfaces } from '../../ui';

export default abstract class {
    private static buildTitle(title: string, ext: string, pageNumber: number, index: number): string {
        let orderNumber: number = (pageNumber - 1) * CONFIG.RESULTS_PAGE_SIZE + index + 1;
        let orderTitle: string = `[${orderNumber}]`;

        let titleBody: string = ` [${ext}] ${title}`;

        let finalTitle = `${orderTitle}${titleBody}`;

        if (finalTitle.length > CONFIG.TITLE_MAX_STRLEN) {
            finalTitle = finalTitle.substr(0, CONFIG.TITLE_MAX_STRLEN - 3) + '...';
        }
        
        return finalTitle;
    }

    public static getListObject(entries: Interfaces.Entry[], pageNumber: number): UIInterfaces.ListObject {
        return {
            type: 'list',
            listedItemCount: CONFIG.UI_PAGE_SIZE,
            listings: this.getListingObjectArr(entries, pageNumber)
        }
    }

    private static getListingObjectArr(
        entries: Interfaces.Entry[], 
        pageNumber: number): UIInterfaces.ListingObject[] {

        let listingObjects: UIInterfaces.ListingObject[];

        listingObjects = entries.map((e: Interfaces.Entry, i: number) => {
            let title: string = this.buildTitle(e.Title, e.Ext, pageNumber, i);

            return this.getEntryListingObject(title, i, e.ID);
        });

        return listingObjects;
    }

    private static getEntryListingObject(title: string, index: number, id: string): UIInterfaces.ListingObject {
        return {
            text: title,
            value: index.toString(),
            
            submenu: [
                {
                    text: CONSTANTS.DOWNLOAD_LISTING.DOWNLOAD_DIRECTLY,
                    actionID: CONSTANTS.DOWNLOAD_LISTING.DOWNLOAD_RES_VAL,
                    value: id,
                    isSubmenuListing: true,
                    isCheckable: false
                }
            ],

            isSubmenuListing: false,
            isSubmenuOpen: false,
            isCheckable: true,
            checkBtnText: CONSTANTS.SUBMENU_LISTINGS.CHECK,
            unCheckBtnText: CONSTANTS.SUBMENU_LISTINGS.UNCHECK,
            submenuToggleBtnText: CONSTANTS.SUBMENU_LISTINGS.CLOSEBTN
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

    public static getEntryDetailsListObject(entryIndex: number): UIInterfaces.ListObject {
        return {
            type: 'list',
            listedItemCount: 2,
            listings: this.getEntryDetailListingObjectArr(entryIndex)
        }
    }

    private static getEntryDetailListingObjectArr(entryIndex: number): UIInterfaces.ListingObject[] {
        let listings: UIInterfaces.ListingObject[] = [];

        listings.push(this.getOptionListingObject(
            CONSTANTS.TURN_BACK_LISTING.TURN_BACK,
            CONSTANTS.TURN_BACK_LISTING.TURN_BACK_RESULT_ID
        ));

        listings.push(this.getOptionListingObject(
            CONSTANTS.DOWNLOAD_LISTING.DOWNLOAD,
            CONSTANTS.DOWNLOAD_LISTING.DOWNLOAD_RES_VAL,
            entryIndex.toString()
        ));

        return listings;
    }

    public static getAfterDownloadListObject(): UIInterfaces.ListObject {
        return {
            type: 'list',
            listedItemCount: 2,
            listings: this.getAfterDownloadListingObjectArr()
        }
    }

    private static getAfterDownloadListingObjectArr(): UIInterfaces.ListingObject[] {
        let listings: UIInterfaces.ListingObject[] = [];

        listings.push(this.getOptionListingObject(
            CONSTANTS.TURN_BACK_LISTING.TURN_BACK,
            CONSTANTS.TURN_BACK_LISTING.TURN_BACK_RESULT_ID
        ));

        listings.push(this.getOptionListingObject(
            CONSTANTS.EXIT.EXIT,
            CONSTANTS.EXIT.EXIT_RESULT_ID
        ));

        return listings;
    }

    public static getAfterNoResultListObject(): UIInterfaces.ListObject {
        return {
            type: 'list',
            listedItemCount: 2,
            listings: this.getAfterNoResultListingObjectArr()
        }
    }

    private static getAfterNoResultListingObjectArr(): UIInterfaces.ListingObject[] {
        let listings: UIInterfaces.ListingObject[] = [];

        listings.push(this.getOptionListingObject(
            CONSTANTS.SEARCH_ANOTHER_LISTINGS.SEARCH_ANOTHER,
            CONSTANTS.SEARCH_ANOTHER_LISTINGS.SEARCH_ANOTHER_RESULT_ID
        ));

        listings.push(this.getOptionListingObject(
            CONSTANTS.EXIT.EXIT,
            CONSTANTS.EXIT.EXIT_RESULT_ID
        ));

        return listings;
    }
}
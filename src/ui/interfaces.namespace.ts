import { Interfaces as AppInterfaces} from '../app/interfaces.namespace';

export namespace Interfaces {
    interface baseObject {
        text: string;
    }

    export interface promptObject extends baseObject {
        type: 'input';
    }

    export interface ListObject {
        type: 'list';
        bulkDownloadOption: boolean;
        listings: ListingObject[];
        listedItemCount: number;
    }

    export interface ListingObject extends baseObject {
        value: string;
        entryData?: AppInterfaces.Entry;
        isCheckable: boolean;
        checkBtnText?: string;
        unCheckBtnText?: string;

        actionID?: string;

        isSubmenuListing: boolean;
        isSubmenuOpen?: boolean;
        submenu?: ListingObject[];
        submenuToggleBtnText?: string;

        parentOffset?: number;
        disableKeypress?: true;
    }

    export interface TerminalCheckedItemsHashTable {
        [key: string]: AppInterfaces.Entry;
    }

    export interface ReturnObject {
        value: string,
        actionID: string
    }
}
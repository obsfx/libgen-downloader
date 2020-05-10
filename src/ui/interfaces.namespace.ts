export namespace Interfaces {
    interface baseObject {
        text: string;
    }

    export interface promptObject extends baseObject {
        type: 'input';
    }

    export interface ListObject {
        type: 'list';
        listings: ListingObject[];
        listedItemCount: number;
    }

    export interface ListingObject extends baseObject {
        value: string;
        isCheckable: boolean;
        checkBtnText?: string;
        unCheckBtnText?: string;

        actionID?: string;

        isSubmenuListing: boolean;
        isSubmenuOpen?: boolean;
        submenu?: ListingObject[];
        submenuToggleBtnText?: string;

        parentOffset?: number;
    }

    export interface TerminalCheckedItemsHashTable {
        [key: string]: boolean
    }

    export interface ReturnObject {
        value: string,
        actionID: string
    }
}
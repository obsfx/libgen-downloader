import { Types } from './types.namespace';

export namespace Interfaces {
    export interface promptObject {
        type: 'input';
        text: string;
    }

    export interface List {
        listings: (Listing | Dropdown)[];
        listedItemCount: number;
    }

    export interface Listing {
        x: number;
        y: number;

        text: string;
        value: string;
        actionID: string;

        color: Types.color;
        hovercolor: Types.color;

        prefix: string;
        hoverprefix: string;
    }

    export interface Dropdown {
        text: string;
        value: string;
        submenus: Submenu[];
    }

    export interface Submenu extends Listing{
        parentOffset: number;
    }
/*
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
        disableKeypress?: true;
    }

    export interface TerminalCheckedItemsHashTable {
        [key: string]: boolean;
    }

    export interface ReturnObject {
        value: string,
        actionID: string
    }
*/
}

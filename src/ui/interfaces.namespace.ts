import { Types } from './types.namespace';

export namespace Interfaces {
    export interface promptObject {
        type: 'input';
        text: string;
    }

    export interface ListingParams {
        x: number;
        y: number;

        text: string;
        value: string;
        actionID: string;

        color: Types.color;
        hovercolor: Types.color;
    }

    export interface Listing extends ListingParams {
        setXY(x: number, y: number): void;
        render(hover: boolean): void;
    }

    export interface DropdownParams extends ListingParams {
        dropdownlist: Listing[];
    }

    export interface Submenu extends Listing {
        parentOffset: number;
    }

    export interface ReturnObject {
        value: string,
        actionID: string
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

*/
}

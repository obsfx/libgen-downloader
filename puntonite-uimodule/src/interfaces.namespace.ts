import { Types } from './types.namespace';

export namespace Interfaces {
    interface baseObject {
        text: string;
        value: string;
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
        isCheckable: boolean;
        isChecked?: boolean;
        checkBtnText?: string;

        isSubmenuListing: boolean;
        isSubmenuOpen?: boolean;
        submenu?: ListingObject[];
        submenuToggleBtnText?: string;

        parentOffset?: number;
    }
}
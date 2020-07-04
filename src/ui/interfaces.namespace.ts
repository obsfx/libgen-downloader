import { Types } from './types.namespace';

import List from './components/List';

export namespace Interfaces {
    export interface Text {
        id: string;

        x: number;
        y: number;

        text: string;
        renderedtext: string;

        color: Types.color;
        hovercolor: Types.color;

        maxLength: number | null;
        clearStr: string;

        setXY(x: number, y: number): void;
        setText(text: string): void;
        setMaxLength(maxlen: number): void;
        setColors(color: Types.color, hovercolor: Types.color): void;
        adjustText(): void;
        render(hover: boolean): void;
        clear(): void;
        onResize(): void;
    }

    export interface ComponentParams {
        title: string;
        value: string;
        actionID: string;

        color: Types.color;
        hovercolor: Types.color;
    }

    export interface Component extends ComponentParams {
        id: string;

        text: Text;

        x: number;
        y: number;

        zindex: number;

        sublist: List | null;

        setXY(x: number, y: number): void;
        setZIndex(zindex: number): void;

        attachSublist(sublist: List): void;
        detachSublist(): void;

        render(hover: boolean): void;

        eventHandler(key: Types.stdinOnKeyParam): (void | boolean);
        onResize(): void;

        show(): void;
        hide(): void;
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

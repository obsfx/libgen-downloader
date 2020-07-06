import Component from './components/Component';
import Dropdown from './components/Dropdown';

export namespace Types {
    /**
     * process.stdin params
     */
    export type stdinOnStrParam = string | undefined;
    export type stdinOnKeyParam = {
        sequence: string;
        name: string;
        ctrl: boolean;
        meta: boolean;
        shift: boolean;
        code: boolean;
    }

    /**
     * prompt types
     */
    export type promptObjectType = 'input' | 'list';
    
    /**
     * colors
     */ 
    export type color = 'black' |
                        'red' |
                        'green' |
                        'yellow' |
                        'blue' |
                        'magenta' |
                        'cyan' |
                        'white' |
                        'bblack' |
                        'bred' |
                        'bgreen' |
                        'byellow' |
                        'bblue' |
                        'bmagenta' |
                        'bcyan' |
                        'bwhite' |
                        'none';
    export type coloredText = { prefix: string, text: string, suffix: string }

    export type Listing = Component | Dropdown;

    export type ComponentParams = {
        title: string;
        value: string;
        actionID: string;

        color: Types.color;
        hovercolor: Types.color;
    }

    export type ReturnObject = {
        value: string,
        actionID: string
    }
}

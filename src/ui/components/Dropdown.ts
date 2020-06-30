import {Interfaces} from '../interfaces.namespace';
import {Types} from '../types.namespace';

import Listing from './Listing';

import keymap from '../keymap';

export default class Dropdown extends Listing {
    expanded: boolean;

    color: Types.color;
    hovercolor: Types.color;

    constructor(params: Interfaces.ComponentParams) {
        super(params);

        this.expanded = false;

        this.color = 'white';
        this.hovercolor = 'cyan';
    }

    public setXY(x: number, y: number): void {
        this.x = x;
        this.y = y;

        if (this.sublist) {
            this.sublist.setXY(x, y);
        }
    }

    public eventHandler(key: Types.stdinOnKeyParam): boolean {
        let done: boolean = false;

        if (key.name == keymap.PREVLISTING) {
            if (this.sublist) {
                this.sublist.prev(); 
                this.sublist.render();
            }
        }

        if (key.name == keymap.NEXTLISTING) {
            if (this.sublist) {
                this.sublist.next();
                this.sublist.render();
            }
        }

        if (key.name == keymap.DOACTION) {
            done = true;
        }

        /*
         * TODO: make every dropwdown component an instance of ListContainer
         * when a dropdown expanded fade and disable dropdown list and await for a return from child dropdownlisting
         */

        return done;
    }

    public show() {
        if (this.sublist) {
            this.sublist.renderContainer();
            this.sublist.render();
        }
    }
}

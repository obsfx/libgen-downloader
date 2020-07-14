import { Types } from '../types.namespace';

import Terminal from '../modules/Terminal';

import ListingContainer from './ListingContainer';

import keymap from '../keymap';

export default class DropdownList extends ListingContainer { 
    expanded: boolean;

    sublistOnReturnFn: Function | null;
    listingOnReturnFn: Function | null;

    constructor(zindex: number = 0) {
        super(zindex);

        this.expanded = false;

        this.sublistOnReturnFn = null;
        this.listingOnReturnFn = null;

        this.setPaddingLeft(3);
    }

    public render(): void {
        for (let i: number = 0; i < this.listLength; i++) {
            let listing: Types.Listing = this.renderingQueue[i];

            if (listing.constructor.name == 'Listing') {
                this.removePrefixes(this.y + i + this.containerPadding);
            }

            let hover: boolean = i == this.cursorIndex ? true : false;            

            listing.setXY(this.x + this.paddingLeft + this.containerPadding, this.y + i + this.containerPadding);
            listing.text.clear();
            listing.render(hover);
        }

        this.renderCursor();
    }

    public attachOnSublistReturnFn(fn: Function): void {
        this.sublistOnReturnFn = fn
    }

    public detachOnSublistReturnFn(): void {
        this.sublistOnReturnFn = null;
    }

    public attachListingOnReturnFn(fn: Function): void {
        this.listingOnReturnFn = fn;
    }

    public detachListingOnReturnFn(): void {
        this.listingOnReturnFn = null;
    }

    public toggleCheckCurrentListing(): void {
        this.renderingQueue[this.cursorIndex].toggleChecked();
    }

    private removePrefixes(y: number): void {
        Terminal.cursorXY(this.x + this.containerPadding, y);
        process.stdout.write(' '.repeat(this.paddingLeft));
    }

    public eventHandler(key: Types.stdinOnKeyParam): void {
        if (!this.expanded) {
            if (key.name == keymap.PREVLISTING) {
                this.prev();
                this.render();
            }

            if (key.name == keymap.NEXTLISTING) {
                this.next();
                this.render();
            }

            if (key.name == keymap.DOACTION) {
                if (this.renderingQueue[this.cursorIndex].constructor.name == 'Dropdown') {
                    this.expanded = true;

                    this.removePrefixes(this.renderingQueue[this.cursorIndex].y);
                    this.renderingQueue[this.cursorIndex].show();
                } else {
                    if (this.listingOnReturnFn) {
                        this.listingOnReturnFn(this);
                    }
                }
            } 
        } else {
            let sublistReturnObject: Types.ReturnObject | null | void = this.renderingQueue[this.cursorIndex].eventHandler(key);

            if (sublistReturnObject) {

                this.expanded = false;

                this.show();

                if (this.sublistOnReturnFn) {
                    this.sublistOnReturnFn(this, sublistReturnObject);
                }
            }
        }
    }
}

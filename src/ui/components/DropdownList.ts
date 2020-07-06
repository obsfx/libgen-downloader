import { Types } from '../types.namespace';

import ListingContainer from './ListingContainer';

import keymap from '../keymap';

export default class DropdownList extends ListingContainer { 
    expanded: boolean;
    onSublistReturnFn: Function | null;

    constructor(zindex: number = 0) {
        super(zindex);

        this.expanded = false;
        this.onSublistReturnFn = null

        this.setPaddingLeft(7);
    }

    public render(): void {
        for (let i: number = 0; i < this.listLength; i++) {
            let listing: Types.Listing = this.renderingQueue[i];
            let hover: boolean = i == this.cursorIndex ? true : false;

            listing.setXY(this.x + this.paddingLeft + this.containerPadding, this.y + i + this.containerPadding);
            listing.text.clear();
            listing.render(hover);
        }

        this.renderCursor();
    }

    public attachOnSublistReturnFn(fn: Function): void {
        this.onSublistReturnFn = fn
    }

    public detachOnSublistReturnFn(): void {
        this.onSublistReturnFn = null;
    }

    public toggleCheckCurrentListing(): void {
        this.renderingQueue[this.cursorIndex].toggleChecked();
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
                this.expanded = true;

                this.renderingQueue[this.cursorIndex].show();
            }
        } else {
            let sublistReturnObject: Types.ReturnObject | null | void = this.renderingQueue[this.cursorIndex].eventHandler(key);

            if (sublistReturnObject) {

                this.expanded = false;

                this.show();

                if (this.onSublistReturnFn) {
                    this.onSublistReturnFn(this, sublistReturnObject);
                }
            }
        }
    }
}

import { Interfaces } from '../interfaces.namespace';
import { Types } from '../types.namespace';

import ListingContainer from './ListingContainer';

import keymap from '../keymap';

export default class DropdownList extends ListingContainer { 
    popupedListings: Interfaces.Listing[] | null;

    expanded: boolean;
    expandedForeColor: Types.color;

    constructor() {
        super();

        this.popupedListings = null;

        this.expanded = false;
        this.expandedForeColor = 'white';
    }

    public render(): void {
        if (this.printedListingCount > 0) {
            this.clear();
        }

        if (!this.expanded) {
            this.renderCursor();
        }

        this.printedListingCount = 0; 

        let listLength: number = this.renderingQueue.length >= this.listLength ?
            this.listLength :
            this.renderingQueue.length;

        for (let i: number = 0; i < listLength; i++) {
            let listing: Interfaces.Listing = this.renderingQueue[i];
            let hover: boolean = i == this.cursorIndex ? true : false;

            listing.setXY(this.x + this.paddingLeft, this.y + i);
            listing.render(hover);

            this.printedListingCount++;
        }
    }

    protected eventHandler(key: Types.stdinOnKeyParam): void {
        if (!this.expanded) {
            if (key.name == keymap.PREVLISTING) {
                this.prev();
            }

            if (key.name == keymap.NEXTLISTING) {
                this.next();
            }
        }

        /*
         * TODO: make every dropwdown component an instance of ListContainer
         * when a dropdown expanded fade and disable dropdown list and await for a return from child dropdownlisting
         */
    }
}

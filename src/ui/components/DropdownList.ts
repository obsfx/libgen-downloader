import { Types } from '../types.namespace';

import ListingContainer from './ListingContainer';

import keymap from '../keymap';

export default class DropdownList extends ListingContainer { 
    expanded: boolean;
    expandedFadeColor: Types.color;
    expandedIndex: number | null;

    constructor() {
        super();

        this.expanded = false;
        this.expandedFadeColor = 'white';
        this.expandedIndex = null;

        this.setPaddingLeft(4);
    }

    public render(): void {
        if (this.printedListingCount > 0) {
            this.clear();
        }

        this.printedListingCount = 0; 

        for (let i: number = 0; i < this.listLength; i++) {
            let listing: Types.Listing = this.renderingQueue[i];
            let hover: boolean = i == this.cursorIndex ? true : false;

            listing.setXY(this.x + this.paddingLeft + this.containerPadding, this.y + i + this.containerPadding);
            listing.render(hover);

            this.printedListingCount++;
        }

        this.renderCursor();
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
                this.expandedIndex = this.cursorIndex;
                this.expanded = true;

                this.renderingQueue[this.expandedIndex].show();
            }
        } else if (this.expandedIndex != null) {
            let isDone: (void | boolean) = this.renderingQueue[this.expandedIndex].eventHandler(key);

            if (isDone) {
                this.expanded = false;
                this.expandedIndex = null;
            }
        }

        /*
         * TODO: make every dropwdown component an instance of ListContainer
         * when a dropdown expanded fade and disable dropdown list and await for a return from child dropdownlisting
         */
    }
}

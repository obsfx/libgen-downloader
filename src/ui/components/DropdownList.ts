import { Types } from '../types.namespace';

import ListingContainer from './ListingContainer';

import keymap from '../keymap';

export default class DropdownList extends ListingContainer { 
    expanded: boolean;
    expandedFadeColor: Types.color;

    constructor() {
        super();

        this.renderingQueue = [];

        this.expanded = false;
        this.expandedFadeColor = 'white';
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
            let listing: Types.Listing = this.renderingQueue[i];
            let hover: boolean = i == this.cursorIndex ? true : false;

            listing.setXY(this.x + this.paddingLeft, this.y + i);
            listing.render(hover);

            this.printedListingCount++;
        }
    }

    private async expandListing(): Promise<void> {
        this.expanded = true;

        await this.renderingQueue[this.cursorIndex].expand();
    }

    protected async eventHandler(key: Types.stdinOnKeyParam): Promise<void> {
        if (!this.expanded) {
            if (key.name == keymap.PREVLISTING) {
                this.prev();
            }

            if (key.name == keymap.NEXTLISTING) {
                this.next();
            }

            if (key.name == keymap.DOACTION) {
                await this.expandListing();
            }
        }

        /*
         * TODO: make every dropwdown component an instance of ListContainer
         * when a dropdown expanded fade and disable dropdown list and await for a return from child dropdownlisting
         */
    }
}

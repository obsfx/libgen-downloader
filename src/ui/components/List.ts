import { Types } from '../types.namespace';

import ListingContainer from './ListingContainer';

export default class List extends ListingContainer {
    constructor() {
        super();
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
}

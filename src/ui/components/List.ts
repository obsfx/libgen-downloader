import { Interfaces } from '../interfaces.namespace';

import ListingContainer from './ListingContainer';

export default class List extends ListingContainer {
    constructor() {
        super();
    }

    public render(): void {
        if (this.printedListingCount > 0) {
            this.clear();
        }

        this.renderCursor();

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
}

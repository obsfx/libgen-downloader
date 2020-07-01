import { Types } from '../types.namespace';

import ListingContainer from './ListingContainer';

export default class List extends ListingContainer {
    constructor() {
        super();
    }

    public render(): void {
        this.clear();

        for (let i: number = 0; i < this.listLength; i++) {
            let listing: Types.Listing = this.renderingQueue[i];
            let hover: boolean = i == this.cursorIndex ? true : false;

            listing.setXY(this.x + this.paddingLeft + this.containerPadding, this.y + i + this.containerPadding);
            listing.render(hover);
        }

        this.renderCursor();
    }
}

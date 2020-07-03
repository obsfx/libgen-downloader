import { Types } from '../types.namespace';

import ListingContainer from './ListingContainer';

export default class List extends ListingContainer {
    constructor(zindex: number = 0) {
        super(zindex);
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
}

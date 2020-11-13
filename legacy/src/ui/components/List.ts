import { Types } from '../types.namespace';

import ListingContainer from './ListingContainer';

import keymap from '../keymap';

export default class List extends ListingContainer {
    listingOnReturnFn: Function | null;

    constructor(zindex: number = 0) {
        super(zindex);

        this.listingOnReturnFn = null;
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

    public eventHandler(key: Types.stdinOnKeyParam): void {
        if (key.name == keymap.PREVLISTING) {
            this.prev();
            this.render();
        }

        if (key.name == keymap.NEXTLISTING) {
            this.next();
            this.render();
        }

        if (key.name == keymap.DOACTION && this.activeAwait) {
            if (this.listingOnReturnFn) {
                this.listingOnReturnFn(this);
            } else {
                this.terminateAwaiting = true;
            }
        }
    }

    public attachListingOnReturnFn(fn: Function): void {
        this.listingOnReturnFn = fn;
    }

    public detachListingOnReturnFn(): void {
        this.listingOnReturnFn = null;
    }

    public applyCheckedStyle(checked: boolean): void {
        let oldText: string = !checked ?
            'Remove from Bulk Downloading Queue' :
            'Add to Bulk Downloading Queue';
        
        let newText: string = checked ?
            'Remove from Bulk Downloading Queue' :
            'Add to Bulk Downloading Queue';

        for (let i: number = 0; i < this.renderingQueue.length; i++) {
            if (this.renderingQueue[i].text.text == oldText) {
                this.renderingQueue[i].text.setText(newText);
            }
        }
    }

    public toggleChecked(checked: boolean = false): void {
        this.applyCheckedStyle(checked);
        this.show();
    }
}

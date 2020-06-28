import { Interfaces } from '../interfaces.namespace';

import Terminal from '../modules/Terminal';

export default abstract class List {
    private static cursorIndex: number;
    private static printedListingCount : number;
    private static listLength: number;
    private static middleIndex: number;

    private static renderingQueue: Interfaces.Listing[];

    public static attachListingArr(listingArr: Interfaces.Listing[], listLength: number): void {
        this.cursorIndex = 0;
        this.listLength = listLength;
        this.middleIndex = Math.floor(this.listLength / 2);

        this.renderingQueue = listingArr;
    }

    private static clear(x: number, y: number): void {
        for (let i: number = 0; i < this.printedListingCount; i++) {
            Terminal.cursorXY(x, y + i);
            Terminal.clearLine();
        }
    }

    public static render(x: number, y: number): void {
        if (this.printedListingCount > 0) {
            this.clear(x, y);
        }

        this.printedListingCount = 0; 

        let listLength: number = this.renderingQueue.length >= this.listLength ?
             this.listLength :
             this.renderingQueue.length;

        for (let i: number = 0; i < listLength; i++) {
            let listing: Interfaces.Listing = this.renderingQueue[i];
            let hover: boolean = i == this.cursorIndex ? true : false;

            listing.setXY(x, y + i);
            listing.render(hover);

            this.printedListingCount++;
        }
    }

    public static eventHandler(): void {

    }
}

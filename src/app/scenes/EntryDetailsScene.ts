import Scene from './Scene';
import TitleScene from './TitleScene';
import BulkQueueScene from './BulkQueueScene';

import { 
    UITypes,
    EventHandler,
    Terminal, 
    Listing,
    List,
    Colors
} from '../../ui';

import { EntryDetailsSceneOptions } from '../action-templates';

import ACTIONID from '../action-ids';

import App, { Entry } from '../';
import Entries from '../modules/Entries';

export default abstract class EntryDetailsScene extends Scene {
    private static ymargin: number;
    private static list: List = new List();
    private static selectedEntry: Entry;
    private static entryIndex: number;
    private static entryDetailsText: string[];

    public static show(entryIndex: number): void {
        this.entryIndex = entryIndex;
        this.selectedEntry = App.state.entryDataArr[this.entryIndex];
        this.entryDetailsText = Entries.getDetails(this.selectedEntry);

        let listings: UITypes.Listing[] = EntryDetailsSceneOptions.map(
            (e: UITypes.ComponentParams) => (
                new Listing({
                    title: e.title,
                    value: e.actionID == ACTIONID.DOWNLOAD_DIRECTLY ? this.entryIndex.toString() : this.selectedEntry.ID,
                    actionID: e.actionID,
                    color: e.color,
                    hovercolor: e.hovercolor
                })
            )
        )

        this.list.attachListingArr(listings, listings.length);

        this.list.attachListingOnReturnFn((list: List) => {
            let currentListing: UITypes.ReturnObject = list.getCurrentListing();

            if (currentListing.actionID == ACTIONID.ADD_TO_BULK_DOWNLOADING_QUEUE) {
                if (App.bulkQueue[currentListing.value]) {
                    delete App.bulkQueue[currentListing.value];
                    list.toggleChecked(false);
                } else {
                    App.bulkQueue[currentListing.value] = true;
                    list.toggleChecked(true);
                }

                BulkQueueScene.updateQueueLen(Object.keys(App.bulkQueue).length);
            } else {
                list.terminateAwaiting = true;
            }
        });

        EventHandler.attachResizeReRenderEvent(0, 'EntryDetailsScene', this.onResize.bind(this));

        Terminal.hideCursor();
        TitleScene.show();
        this.render();
    }

    public static hide(): void {
        Terminal.showCursor();
        TitleScene.hide();

        for (let i: number = 5; i < 5 + this.entryDetailsText.length + this.ymargin; i++) {
            Terminal.cursorXY(1, i);
            Terminal.clearLine();
        }

        BulkQueueScene.hide();
        EventHandler.detachResizeReRenderEventMap(0, 'EntryDetailsScene');
        this.list.hide();
        this.list.hideInfo();
    }

    public static render(): void {
        this.ymargin = 0;

        Terminal.cursorXY(1, 5);

        for (let i: number = 0; i < this.entryDetailsText.length; i++) {
            let detail: string = this.entryDetailsText[i];
            this.ymargin += Math.floor(Colors.purify(detail).length / process.stdout.columns);
            console.log(detail);
        }

        BulkQueueScene.show(1, 6 + this.entryDetailsText.length + this.ymargin);
        BulkQueueScene.updateQueueLen(Object.keys(App.bulkQueue).length);

        this.list.setXY(2, 7 + this.entryDetailsText.length + this.ymargin);

        if (App.bulkQueue[this.selectedEntry.ID]) {
            this.list.applyCheckedStyle(true);
        }

        this.list.show();
        this.list.showInfo();

    }

    public static onResize(): void {
        this.render();
    }

    public static async awaitForReturn(): Promise<UITypes.ReturnObject> {
        return await this.list.awaitForReturn();
    }
}

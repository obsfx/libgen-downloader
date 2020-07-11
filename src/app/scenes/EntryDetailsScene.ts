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

import App, { Entry } from '../App';
import Entries from '../modules/Entries';

export default abstract class EntryDetailsScene extends Scene {
    private static ymargin: number;
    private static list: List = new List();
    private static selectedEntry: Entry;
    private static entryDetailsText: string[];

    public static show(entryIndex: number): void {
        this.selectedEntry = App.state.entryDataArr[entryIndex];
        this.entryDetailsText = Entries.getDetails(this.selectedEntry);

        EventHandler.attachResizeReRenderEvent(0, 'EntryDetailsScene', this.onResize.bind(this));

        this.render();
    }

    public static hide(): void {
        Terminal.showCursor();
        TitleScene.hide();
        BulkQueueScene.hide();
        EventHandler.detachResizeReRenderEventMap(0, 'EntryDetailsScene');
        this.list.hide();
        this.list.hideInfo();
    }

    public static render(): void {
        this.ymargin = 0;

        Terminal.hideCursor();
        TitleScene.show();

        Terminal.cursorXY(1, 5);
        for (let i: number = 0; i < this.entryDetailsText.length; i++) {
            let detail: string = this.entryDetailsText[i];
            this.ymargin += Math.floor(Colors.purify(detail).length / process.stdout.columns);
            console.log(detail);
        }

        BulkQueueScene.show(1, 6 + this.entryDetailsText.length + this.ymargin);
        BulkQueueScene.updateQueueLen(Object.keys(App.state.bulkQueue).length);

        let options: UITypes.Listing[] = EntryDetailsSceneOptions.map(
            (e: UITypes.ComponentParams) => (
                new Listing({
                    title: e.title,
                    value: this.selectedEntry.ID,
                    actionID: e.actionID,
                    color: e.color,
                    hovercolor: e.hovercolor
                })
            )
        )

        this.list.setXY(2, 7 + this.entryDetailsText.length + this.ymargin);
        this.list.attachListingArr(options, options.length);

        if (App.state.bulkQueue[this.selectedEntry.ID]) {
            this.list.applyCheckedStyle(true);
        }

        this.list.show();
        this.list.showInfo();

        this.list.attachListingOnReturnFn((list: List) => {
            let currentListing: UITypes.ReturnObject = list.getCurrentListing();

            if (currentListing.actionID == ACTIONID.ADD_TO_BULK_DOWNLOADING_QUEUE) {
                if (App.state.bulkQueue[currentListing.value]) {
                    delete App.state.bulkQueue[currentListing.value];
                    list.toggleChecked(false);
                } else {
                    App.state.bulkQueue[currentListing.value] = true;
                    list.toggleChecked(true);
                }

                BulkQueueScene.updateQueueLen(Object.keys(App.state.bulkQueue).length);
            } else {
                list.terminateAwaiting = true;
            }
        });
    }

    public static onResize(): void {
        this.render();
    }

    public static async awaitForReturn(): Promise<UITypes.ReturnObject> {
        return await this.list.awaitForReturn();
    }
}

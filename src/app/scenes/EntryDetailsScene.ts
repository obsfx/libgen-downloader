import Scene from './Scene';
import TitleScene from './TitleScene';

import { 
    UITypes,
    EventHandler,
    Terminal, 
    Listing,
    List,
    Colors
} from '../../ui';

import { EntryDetailsSceneOptions } from '../action-templates';

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
        TitleScene.hide();
        EventHandler.detachResizeReRenderEventMap(0, 'EntryDetailsScene');
        this.list.hide();
    }

    public static render(): void {
        this.ymargin = 0;

        TitleScene.show();

        Terminal.cursorXY(1, 5);
        for (let i: number = 0; i < this.entryDetailsText.length; i++) {
            let detail: string = this.entryDetailsText[i];
            this.ymargin += Math.floor(Colors.purify(detail).length / process.stdout.columns);
            console.log(detail);
        }


        let options: UITypes.Listing[] = EntryDetailsSceneOptions.map(
            (e: UITypes.ComponentParams) => (
                new Listing({
                    title: e.title,
                    value: e.value,
                    actionID: e.actionID,
                    color: e.color,
                    hovercolor: e.hovercolor
                })
            )
        )

        this.list.setXY(2, 7 + this.entryDetailsText.length + this.ymargin);
        this.list.attachListingArr(options, options.length);
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

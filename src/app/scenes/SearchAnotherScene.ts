import Scene from './Scene';
import TitleScene from './TitleScene';

import {
    UITypes,
    Terminal,
    EventHandler,
    Colors,
    Listing,
    List
} from '../../ui';

import { SearchAnotherSceneOptions } from '../action-templates';

export default abstract class SearchAnotherScene extends Scene {
    private static x: number;
    private static y: number;
    private static ymargin: number;

    private static showDIR: boolean = false;
    private static outputs: string[];
    private static list: List = new List();

    public static show(x: number, y: number, message: string, showDIR: boolean = false): void {
        this.x = x;
        this.y = y;

        this.outputs = [ message ];

        this.showDIR = showDIR;

        if (this.showDIR) {
            this.outputs.push(Colors.get('cyan', process.cwd()));
        }

        let listings: UITypes.Listing[] = SearchAnotherSceneOptions.map(
            (e: UITypes.ComponentParams) => (
                new Listing({
                    title: e.title,
                    value: e.value,
                    actionID: e.actionID,
                    color: e.color,
                    hovercolor: e.hovercolor
                })
            )
        );

        this.list.attachListingArr(listings, listings.length);

        EventHandler.attachResizeReRenderEvent(0, 'SearchAnotherScene', this.onResize.bind(this));

        Terminal.hideCursor();
        TitleScene.show();

        this.render();
    }

    public static render(): void {
        this.ymargin = 0;

        Terminal.cursorXY(this.x, this.y);

        for (let i: number = 0; i < this.outputs.length; i++) {
            let output: string = this.outputs[i];
            this.ymargin += Math.floor(Colors.purify(output).length / process.stdout.columns);
            console.log(output);
        }
 
        this.list.setXY(this.x + 1, this.y + this.outputs.length + this.ymargin + 3);
        this.list.show();
        this.list.showInfo();
    }

    public static hide(): void {
        TitleScene.hide();

        for (let i: number = this.y; i < this.y + this.outputs.length + this.ymargin; i++) {
            Terminal.cursorXY(1, i);
            Terminal.clearLine();
        }

        EventHandler.detachResizeReRenderEventMap(0, 'SearchAnotherScene');

        this.list.hide();
        this.list.hideInfo();
    }

    public static onResize(): void {
        this.render();
    }

    public static async awaitForReturn(): Promise<UITypes.ReturnObject> {
        return await this.list.awaitForReturn();
    }
}

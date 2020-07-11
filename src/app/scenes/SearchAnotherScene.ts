import Scene from './Scene';

import {
    UITypes,
    Terminal,
    Text,
    Listing,
    List
} from '../../ui';

import { SearchAnotherSceneOptions } from '../action-templates';

export default abstract class SearchAnotherScene extends Scene {
    private static message: Text = new Text('', 'none');
    private static list: List = new List();

    public static show(x: number, y: number, message: string): void {
        Terminal.hideCursor();

        this.message.setXY(x, y);
        this.message.setText(message)
        this.attachText(this.message);

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

        this.list.setXY(x + 1, y + 1);
        this.list.attachListingArr(listings, listings.length);
        this.list.show();
        this.list.showInfo();
    }

    public static hide(): void {
        this.detachText(this.message);

        this.list.hide();
        this.list.hideInfo();
    }

    public static async awaitForReturn(): Promise<UITypes.ReturnObject> {
        return await this.list.awaitForReturn();
    }
}

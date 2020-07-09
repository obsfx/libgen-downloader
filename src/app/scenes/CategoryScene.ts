import CONFIG from '../config';
import { CATEGORY } from '../outputs';

import Scene from './Scene';
import TitleScene from './TitleScene';

import { 
    UITypes, 
    Terminal,
    Text,
    Listing,
    List
} from '../../ui';

import { CategorySceneListings } from '../action-templates';

export default abstract class CategoryScene extends Scene {
    private static headText: Text = new Text(CATEGORY.WHICH_CAT, 'yellow');
    private static list: List = new List();

    public static show(): void {
        Terminal.hideCursor();

        TitleScene.show();

        let listings: UITypes.Listing[] = CategorySceneListings.map(
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

        this.list.setXY(2, 6);
        this.list.attachListingArr(listings, CONFIG.UI_PAGE_SIZE);
        this.list.show();
        this.list.showInfo();

        this.headText.setXY(1, 5)
        this.attachText(this.headText)
    }

    public static hide(): void {
        Terminal.showCursor();

        this.list.hide();
        this.list.hideInfo();

        this.detachText(this.headText);

        TitleScene.hide();
    }

    public static async awaitForReturn(): Promise<UITypes.ReturnObject> {
        return await this.list.awaitForReturn();
    }
}

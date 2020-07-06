import CONFIG from '../config';
import { 
    CATEGORY,
    USAGE_INFO
} from '../outputs';

import Scene from './Scene';
import TitleScene from './TitleScene';

import { 
    UITypes, 
    Text,
    Listing,
    List
} from '../../ui';

import { CategorySceneListings } from '../action-templates';

export default abstract class CategoryScene extends Scene {
    private static headText: Text = new Text(CATEGORY.WHICH_CAT, 'yellow');
    private static infoText: Text = new Text(USAGE_INFO, 'white');
    private static list: List = new List();

    public static show(): void {
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

        this.list.setXY(2, 7);
        this.list.attachListingArr(listings, CONFIG.UI_PAGE_SIZE);
        this.list.show();

        this.headText.setXY(1, 6)
        this.attachText(this.headText)

        this.infoText.setXY(1, 7 + listings.length + 2)
        this.attachText(this.infoText);
    }

    public static hide(): void {
        this.list.hide();

        this.detachText(this.headText);
        this.detachText(this.infoText);

        TitleScene.hide();
    }

    public static async awaitForReturn(): Promise<UITypes.ReturnObject> {
        return await this.list.awaitForReturn();
    }
}

import CONFIG from '../config';
import CONSTANTS from '../constants';

import TitleScene from './TitleScene';

import { 
    UIInterfaces, 
    UITypes, 

    EventHandler,

    Text,

    Listing,
    List
} from '../../ui';

import { 
    CategorySceneList,
    CategorySceneListings,
} from '../ui-templates';

export default abstract class CategoryScene {
    private static headText: Text = new Text('Which category will you search in ?', 'yellow');
    private static infoText: Text = new Text(CONSTANTS.USAGE_INFO, 'white');
    private static list: List = new List();

    public static show(): void {
        TitleScene.show();

        let listings: UITypes.Listing[] = CategorySceneListings.map(
            (e: UIInterfaces.ComponentParams) => (
                new Listing({
                    title: e.title,
                    value: e.value,
                    actionID: e.actionID,
                    color: e.color,
                    hovercolor: e.hovercolor
                })
            )
        );

        this.list.setXY(CategorySceneList.x, CategorySceneList.y);
        this.list.attachListingArr(listings, CONFIG.UI_PAGE_SIZE);

        this.headText.setXY(CategorySceneList.x - 1, CategorySceneList.y - 1);
        EventHandler.attachResizeReRenderEvent(0, this.headText.id, this.headText.onResize.bind(this.headText));
        this.headText.onResize();

        this.list.show();

        this.infoText.setXY(CategorySceneList.x - 1, CategorySceneList.y + listings.length + 2);
        EventHandler.attachResizeReRenderEvent(0, this.infoText.id, this.infoText.onResize.bind(this.infoText));
        this.infoText.onResize();
    }

    public static hide(): void {
        EventHandler.detachResizeReRenderEventMap(0, this.headText.id);
        this.headText.clear();

        this.list.hide();

        EventHandler.detachResizeReRenderEventMap(0, this.infoText.id);
        this.infoText.clear();

        TitleScene.hide();
    }

    public static async awaitForReturn(): Promise<UIInterfaces.ReturnObject> {
        return await this.list.awaitForReturn();
    }
}

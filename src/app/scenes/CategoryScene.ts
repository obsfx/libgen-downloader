import CONFIG from '../config';

import { 
    UIInterfaces, 
    UITypes, 

    Listing,
    List
} from '../../ui';

import { 
    CategorySceneList,
    CategorySceneListings,
} from '../ui-templates';

export default abstract class CategoryScene {
    private static list: List = new List();

    public static show(): void {
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
        this.list.show();
    }

    public static hide(): void {
        this.list.hide();
    }

    public static async awaitForReturn(): Promise<UIInterfaces.ReturnObject> {
        return await this.list.awaitForReturn();
    }
}

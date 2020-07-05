import { Interfaces } from '../interfaces.namespace';

import CONFIG from '../config';

import TitleScene from './TitleScene';

import { 
    UIInterfaces, 
    UITypes, 

    Listing,
    List,

    Dropdown,
    DropdownList,
} from '../../ui';

import { 
    ResultsSceneListings
} from '../ui-templates';

export default abstract class ResultsScene {
    private static list: DropdownList = new DropdownList();

    public static show(entries: Interfaces.Entry[]): void {
        TitleScene.show();

        let listings: Dropdown[] = entries.map((e: Interfaces.Entry) => {
            let sublistings: UITypes.Listing[] = ResultsSceneListings.map(
                (listing: UIInterfaces.ComponentParams) => (
                    new Listing({
                        title: listing.title,
                        value: listing.value,
                        actionID: listing.actionID,
                        color: listing.color,
                        hovercolor: listing.hovercolor
                    })
                )
            );

            let sublist: List = new List(1);

            sublist.attachListingArr(sublistings, sublistings.length);

            let dropdown: Dropdown = new Dropdown({
                title: e.Title,
                value: e.ID,
                actionID: '',
                color: 'white',
                hovercolor: 'cyan'
            });

            dropdown.attachSublist(sublist);

            return dropdown;
        });

        this.list.setContainerWidth(60);
        this.list.setXY(2, 7);
        this.list.attachListingArr(listings, CONFIG.UI_PAGE_SIZE);
        this.list.show();
    }

    public static hide(): void {
        this.list.hide();

        TitleScene.hide();
    }

    public static async awaitForReturn(): Promise<UIInterfaces.ReturnObject> {
        return await this.list.awaitForReturn();
    }
}

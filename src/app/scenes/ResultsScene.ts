import { USAGE_INFO } from '../outputs';
import CONFIG from '../config';

import Scene from './Scene';
import TitleScene from './TitleScene';
import BulkQueueScene from './BulkQueueScene';

import { 
    UITypes, 
    Listing,
    Text,
    List,
    Dropdown,
    DropdownList,
} from '../../ui';

import { ResultsSceneActionIDS } from '../../app/action-ids';

import App, { Entry } from '../App';

import { 
    ResultsSceneOptionListings,
    ResultsSceneSubListings
} from '../action-templates';

export default abstract class ResultsScene extends Scene {
    private static list: DropdownList = new DropdownList();
    private static infoText: Text = new Text(USAGE_INFO, 'white');

    public static show(entries: Entry[]): void {
        TitleScene.show();

        BulkQueueScene.show(1, 5);
        BulkQueueScene.updateQueueLen(Object.keys(App.state.bulkQueue).length);

        let options: Listing[] = ResultsSceneOptionListings.map(
            (listing: UITypes.ComponentParams) => (
                new Listing({
                    title: listing.title,
                    value: listing.value,
                    actionID: listing.actionID,
                    color: listing.color,
                    hovercolor: listing.hovercolor
                })
            )
        );

        let listings: Dropdown[] = entries.map((e: Entry) => {
            let sublistings: UITypes.Listing[] = ResultsSceneSubListings.map(
                (listing: UITypes.ComponentParams) => (
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

            if (App.state.bulkQueue[e.ID]) {
                dropdown.toggleChecked();
            }

            return dropdown;
        });

        this.list.setContainerWidth(60);
        this.list.setXY(2, 6);
        this.list.attachListingArr([...options, ...listings], CONFIG.UI_PAGE_SIZE);
        this.list.show();

        this.list.attachOnSublistReturnFn((dropdownlist: DropdownList, sublistReturnObject: UITypes.ReturnObject) => {
            if (sublistReturnObject.actionID == ResultsSceneActionIDS.ADD_TO_BULK_DOWNLOADING_QUEUE) {
                dropdownlist.toggleCheckCurrentListing();
                
                let currentListing: UITypes.ReturnObject = dropdownlist.getCurrentListing();

                if (App.state.bulkQueue[currentListing.value]) {
                    delete App.state.bulkQueue[currentListing.value];
                } else {
                    App.state.bulkQueue[currentListing.value] = true;
                }

                BulkQueueScene.updateQueueLen(Object.keys(App.state.bulkQueue).length);
            } else if (sublistReturnObject.actionID == ResultsSceneActionIDS.SEE_DETAILS || 
                       sublistReturnObject.actionID == ResultsSceneActionIDS.DOWNLOAD_DIRECTLY) {
                dropdownlist.terminateAwaiting = true;
                dropdownlist.setCurrentListingActionID(sublistReturnObject.actionID);
            }
        });

        this.infoText.setXY(1, 6 + CONFIG.UI_PAGE_SIZE + 2);
        this.attachText(this.infoText);
    }

    public static hide(): void {
        TitleScene.hide();
        BulkQueueScene.hide();
        this.list.hide();
        this.detachText(this.infoText);
    }

    public static async awaitForReturn(): Promise<UITypes.ReturnObject> {
        return await this.list.awaitForReturn();
    }
}

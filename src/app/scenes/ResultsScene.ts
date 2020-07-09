import { RESULTS_TITLE } from '../outputs';
import CONFIG from '../config';

import Scene from './Scene';
import TitleScene from './TitleScene';
import BulkQueueScene from './BulkQueueScene';

import { 
    UITypes, 
    Terminal,
    Text,
    Listing,
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
    private static results: Text = new Text(RESULTS_TITLE, 'none');

    public static show(): void {
        Terminal.hideCursor();
        TitleScene.show();

        BulkQueueScene.show(1, 6);
        BulkQueueScene.updateQueueLen(Object.keys(App.state.bulkQueue).length);

        this.results.setXY(1, 7);
        this.results.setText(RESULTS_TITLE
            .replace('{query}', decodeURIComponent(App.state.query || ''))
            .replace('{page}', App.state.currentPage.toString()));
        this.attachText(this.results);

        let options: Listing[] = []

        for (let i: number = 0; i < ResultsSceneOptionListings.length; i++) {
            let option: UITypes.ComponentParams = ResultsSceneOptionListings[i];

            if ((App.state.currentPage == 1 && option.actionID == ResultsSceneActionIDS.PREV_PAGE) ||
                !App.isNextPageExist()) {
                continue;
            }

            options.push(
                new Listing({
                    title: option.title,
                    value: option.value,
                    actionID: option.actionID,
                    color: option.color,
                    hovercolor: option.hovercolor
                })
            );
        }

        let listings: Dropdown[] = App.state.entryDataArr.map((e: Entry, i: number) => {
            let sublistings: UITypes.Listing[] = ResultsSceneSubListings.map(
                (listing: UITypes.ComponentParams) => (
                    new Listing({
                        title: listing.title,
                        value: e.ID,
                        actionID: listing.actionID,
                        color: listing.color,
                        hovercolor: listing.hovercolor
                    })
                )
            );

            let sublist: List = new List(1);

            sublist.attachListingArr(sublistings, sublistings.length);

            let dropdownTitle: string = `[${(i + 1) + CONFIG.RESULTS_PAGE_SIZE * (App.state.currentPage- 1)}] [${e.Ext}] ${e.Title}`;

            let dropdown: Dropdown = new Dropdown({
                title: dropdownTitle,
                value: i.toString(),
                actionID: '',
                color: 'white',
                hovercolor: 'cyan'
            });

            dropdown.attachSublist(sublist);

            if (App.state.bulkQueue[e.ID]) {
                dropdown.applyCheckedStyle();
            }

            return dropdown;
        });

        this.list.setContainerWidth(70);
        this.list.setXY(2, 8);
        this.list.attachListingArr([...options, ...listings], CONFIG.UI_PAGE_SIZE);
        this.list.show();
        this.list.showInfo();

        this.list.attachOnSublistReturnFn((dropdownlist: DropdownList, sublistReturnObject: UITypes.ReturnObject) => {
            dropdownlist.showInfo();

            if (sublistReturnObject.actionID == ResultsSceneActionIDS.ADD_TO_BULK_DOWNLOADING_QUEUE) {
                dropdownlist.toggleCheckCurrentListing();

                if (App.state.bulkQueue[sublistReturnObject.value]) {
                    delete App.state.bulkQueue[sublistReturnObject.value];
                } else {
                    App.state.bulkQueue[sublistReturnObject.value] = true;
                }

                BulkQueueScene.updateQueueLen(Object.keys(App.state.bulkQueue).length);
            } else if (sublistReturnObject.actionID == ResultsSceneActionIDS.SEE_DETAILS || 
                       sublistReturnObject.actionID == ResultsSceneActionIDS.DOWNLOAD_DIRECTLY) {
                dropdownlist.terminateAwaiting = true;
                dropdownlist.setCurrentListingActionID(sublistReturnObject.actionID);
            }
        });

        this.list.attachListingOnReturnFn((dropdown: DropdownList) => {
            let currentListing: UITypes.ReturnObject = dropdown.getCurrentListing();

            if (currentListing.actionID == ResultsSceneActionIDS.START_BULK &&
                Object.keys(App.state.bulkQueue).length < 1) {
                dropdown.terminateAwaiting = false;
                BulkQueueScene.showNoFileWarning(1, 5);
            } else {
                dropdown.terminateAwaiting = true;
            }
        });
    }

    public static hide(): void {
        Terminal.showCursor();
        TitleScene.hide();
        this.detachText(this.results);
        BulkQueueScene.hide();
        this.list.hide();
        this.list.hideInfo();
    }

    public static async awaitForReturn(): Promise<UITypes.ReturnObject> {
        return await this.list.awaitForReturn();
    }
}

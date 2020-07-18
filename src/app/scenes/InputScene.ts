import { 
    CATEGORY,
    INPUT_TITLE,
    INPUT_MINLEN_WARNING
} from '../outputs';

import { 
    UITypes, 
    Terminal,
    EventHandler,
    Input,
    Text
} from '../../ui';

import Scene from './Scene';
import TitleScene from './TitleScene';
import BulkQueueScene from './BulkQueueScene';

import App from '../';

export default abstract class InputScene extends Scene {
    private static queryMinLenWarning: boolean;

    public static selectedCategory: Text = new Text(CATEGORY.SELECTED_CAT, 'none');
    public static minLenWarning: Text = new Text(INPUT_MINLEN_WARNING, 'none');

    public static show(queryMinLenWarning: boolean): void {
        this.queryMinLenWarning = queryMinLenWarning;

        TitleScene.show();

        BulkQueueScene.show(1, 5);
        BulkQueueScene.updateQueueLen(Object.keys(App.bulkQueue).length);

        if (this.queryMinLenWarning) {
            this.minLenWarning.setXY(1, 4);
            this.attachText(this.minLenWarning);
        }

        Input.set(2, 6, INPUT_TITLE);
        Input.render();

        Terminal.showCursor();
        EventHandler.rawMode(false);
        EventHandler.attachResizeReRenderEvent(0, Input.id, Input.onResize.bind(Input))
    }

    public static hide(): void {
        TitleScene.hide();
        BulkQueueScene.hide();

        if (this.queryMinLenWarning) {
            this.queryMinLenWarning = false;
            this.detachText(this.minLenWarning);
        }

        this.detachText(this.selectedCategory);

        Terminal.hideCursor();
        EventHandler.rawMode(true);
        EventHandler.detachResizeReRenderEventMap(0, Input.id);
    }

    public static async awaitForReturn(): Promise<UITypes.ReturnObject> {
        return await Input.awaitForReturn();
    }
}

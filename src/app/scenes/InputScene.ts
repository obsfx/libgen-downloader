import { 
    CATEGORY,
    INPUT_TITLE,
    INPUT_MINLEN_WARNING
} from '../outputs';

import { 
    UITypes, 
    EventHandler,
    Input,
    Text
} from '../../ui';

import TitleScene from './TitleScene';
import Scene from './Scene';

export default abstract class InputScene extends Scene {
    private static category: string = '';
    private static queryMinLenWarning: boolean;

    public static selectedCategory: Text = new Text(CATEGORY.SELECTED_CAT, 'none');
    public static minLenWarning: Text = new Text(INPUT_MINLEN_WARNING, 'none');

    public static show(category: string, queryMinLenWarning: boolean): void {
        this.category = category;
        this.queryMinLenWarning = queryMinLenWarning;

        TitleScene.show();

        if (this.queryMinLenWarning) {
            this.minLenWarning.setXY(1, 5);
            this.attachText(this.minLenWarning);
        }

        this.selectedCategory.setXY(1, 6);
        this.selectedCategory.setText(this.selectedCategory.text.replace('{category}', this.category));
        this.attachText(this.selectedCategory);

        Input.set(2, 7, INPUT_TITLE);
        Input.render();

        EventHandler.attachResizeReRenderEvent(0, Input.id, Input.onResize.bind(Input))
    }

    public static hide(): void {
        TitleScene.hide();

        if (this.queryMinLenWarning) {
            this.queryMinLenWarning = false;
            this.detachText(this.minLenWarning);
        }

        this.selectedCategory.setText(this.selectedCategory.text.replace(this.category, '{category}'));
        this.detachText(this.selectedCategory);

        EventHandler.detachResizeReRenderEventMap(0, Input.id);
    }

    public static async awaitForReturn(): Promise<UITypes.ReturnObject> {
        return await Input.awaitForReturn();
    }
}

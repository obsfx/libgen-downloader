import {
    TitleSceneParts
} from '../ui-templates';

import { 
    EventHandler,
} from '../../ui';

export default abstract class TitleScene {
    public static show(): void {
        for (let i: number = 0; i < TitleSceneParts.length; i++) {
            TitleSceneParts[i].text.setXY(TitleSceneParts[i].x, TitleSceneParts[i].y);

            EventHandler.attachResizeReRenderEvent(0, TitleSceneParts[i].text.id, 
            TitleSceneParts[i].text.onResize.bind(TitleSceneParts[i].text));

            TitleSceneParts[i].text.onResize();
        }
    }

    public static hide(): void {
        for (let i: number = 0; i < TitleSceneParts.length; i++) {
            EventHandler.detachResizeReRenderEventMap(0, TitleSceneParts[i].text.id);

            TitleSceneParts[i].text.clear();
        }
    }
}

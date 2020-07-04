import CONSTANTS from '../constants';

import { 
    EventHandler,

    Text,
} from '../../ui';

export default abstract class TitleScene {
    private static headParts: Text[] = CONSTANTS.HEAD.map((e: string) => new Text(e, 'none'))

    public static show(): void {
        for (let i: number = 0; i < this.headParts.length; i++) {
            this.headParts[i].setXY(1, 1 + i);
            EventHandler.attachResizeReRenderEvent(0, this.headParts[i].id, 
                                                   this.headParts[i].onResize.bind(this.headParts[i]));
            this.headParts[i].onResize();
        }
    }

    public static hide(): void {
        for (let i: number = 0; i < this.headParts.length; i++) {
            EventHandler.detachResizeReRenderEventMap(0, this.headParts[i].id);
            this.headParts[i].clear();
        }
    }
}

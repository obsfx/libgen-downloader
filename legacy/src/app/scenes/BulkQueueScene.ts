import { BULK } from '../outputs';

import { 
    Terminal,
    Text
} from '../../ui';

import Scene from './Scene';

export default abstract class BulkQueueScene extends Scene {
    private static x: number;
    private static y: number;

    private static queueLen: Text = new Text('', 'none');
    private static noFile: Text = new Text(BULK.NO_FILE, 'none');
    private static noFileTO: ReturnType<typeof setTimeout> | null;

    public static show(x: number, y: number): void {
        this.x = x;
        this.y = y;

        this.queueLen.setXY(x, y);
        this.queueLen.setText(BULK.QUEUE_LEN.replace('{count}', '0'));
        this.attachText(this.queueLen);
    }

    public static hide(): void {
        this.detachText(this.queueLen);
        this.detachText(this.noFile);

        Terminal.cursorXY(this.x, this.y);

        if (this.noFileTO) {
            clearTimeout(this.noFileTO);
            this.noFileTO = null;
        }
    }

    public static updateQueueLen(length: number): void {
        this.queueLen.setText(BULK.QUEUE_LEN.replace('{count}', length.toString()));
        this.queueLen.onResize();
    }

    public static showNoFileWarning(x: number, y: number): void {
        if (this.noFileTO == null) {
            this.noFile.setXY(x, y);
            this.attachText(this.noFile);

            this.noFileTO = setTimeout(() => {
                this.detachText(this.noFile);
                this.noFileTO = null;
            }, 3000);
        }
    }
}

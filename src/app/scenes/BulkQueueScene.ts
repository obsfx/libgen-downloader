import { BULK } from '../outputs';

import { Text } from '../../ui';

import Scene from './Scene';

export default abstract class BulkQueueScene extends Scene {
    public static queueLen: Text = new Text(BULK.QUEUE_LEN.replace('{count}', '0'), 'none');

    public static show(x: number, y: number): void {
        this.queueLen.setXY(x, y);
        this.attachText(this.queueLen);
    }

    public static hide(): void {
        this.detachText(this.queueLen);
    }

    public static updateQueueLen(length: number): void {
        this.queueLen.setText(BULK.QUEUE_LEN.replace('{count}', length.toString()));
        this.queueLen.onResize();
    }
}

import { TITLE }from '../outputs'; 

import { Text } from '../../ui';

import Scene from './Scene';

export default abstract class TitleScene extends Scene {
    private static titleParts: Text[] = TITLE.map((e: string, i: number) => {
        let text: Text = new Text(e, 'none');
        text.setXY(1, 1 + i);

        return text;
    });

    public static show(): void {
        for (let i: number = 0; i < this.titleParts.length; i++) {
            this.attachText(this.titleParts[i]);
        }
    }

    public static hide(): void {
        for (let i: number = 0; i < this.titleParts.length; i++) {
            this.detachText(this.titleParts[i]);
        }
    }
}

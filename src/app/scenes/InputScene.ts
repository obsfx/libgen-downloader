import { UIInterfaces } from '../../ui';

import TitleScene from './TitleScene';

import { Input } from '../../ui';

import { Input as InputT } from '../ui-templates';

export default abstract class InputScene {
    public static show(): void {
        TitleScene.show();

        Input.set(InputT.x, InputT.y, InputT.title);
        Input.render();
    }

    public static hide(): void {
        TitleScene.hide();
    }

    public static async awaitForReturn(): Promise<UIInterfaces.ReturnObject> {
        return await Input.awaitForReturn();
    }
}

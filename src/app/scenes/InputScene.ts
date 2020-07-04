import { UIInterfaces } from '../../ui';

import { Input } from '../../ui';

import { Input as InputT } from '../ui-templates';

export default abstract class InputScene {
    public static show(): void {
        Input.set(InputT.x, InputT.y, InputT.title);
        Input.render();
    }

    public static async awaitForReturn(): Promise<UIInterfaces.ReturnObject> {
        return await Input.awaitForReturn();
    }
}

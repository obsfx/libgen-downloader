import { Types } from '../types.namespace';

import Terminal from '../modules/Terminal';

import readline from 'readline';

export default abstract class EventHandler {
    private static attachedFn: Function | null = null;

    public static init(): void {
        process.stdin.on('keypress', (_: Types.stdinOnStrParam, key: Types.stdinOnKeyParam) => {
            if (key.ctrl && key.name == 'c') {
                Terminal.showCursor();
                process.exit(0);
            }

            if (this.attachedFn) {
                this.attachedFn(key);
            }
        });
    }

    public static emitKeypressEvents(): void {
        readline.emitKeypressEvents(process.stdin);
    }
    
    public static attach(attachedFn: Function): void {
        this.attachedFn = attachedFn;
        process.stdin.setRawMode(true);

        Terminal.hideCursor();
    }

    public static detach(): void {
        this.attachedFn = null;

        process.stdin.setRawMode(false);
    }
}

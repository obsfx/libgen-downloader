import { Interfaces } from '../interfaces.namespace';
import { Types } from '../types.namespace';

import readline from 'readline';

import constants from '../constants';
import keymap from '../keymap';
import Terminal from './Terminal';

export default abstract class Main {
    private static rl: readline.Interface;

    private static state: string | null = null;
    private static returnedVal: Interfaces.ReturnObject | null = null;
    private static returnedListing: Interfaces.ListingObject;

    public static init(): void {
        this.rl = readline.createInterface({
            input: process.stdin
        });

        this.initEventHandlers();
        Terminal.clear();
    }

    public static async prompt(promptObject: Interfaces.promptObject | Interfaces.ListObject): Promise<Interfaces.ReturnObject> {
        if (promptObject.type == 'input') {
            return await this.promptInput(promptObject);
        } else if (promptObject.type == 'list') {
            return await this.promptList(promptObject);
        }

        return { value: '', actionID: '' };
    }

    public static async promptList(listObject: Interfaces.ListObject): Promise<Interfaces.ReturnObject> {
        Terminal.hideCursor();

        process.stdin.setRawMode(true);

        this.state = constants.STATE.LIST;
        this.returnedVal = null;

        Terminal.promptList(listObject.listings, listObject.listedItemCount, listObject.bulkDownloadOption);

        return await this.listenForReturn<Interfaces.ReturnObject>();
    }

    public static async promptInput(promptObject: Interfaces.promptObject): Promise<Interfaces.ReturnObject> {
        Terminal.showCursor();

        process.stdin.setRawMode(false);

        this.state = constants.STATE.INPUT;
        this.returnedVal = null;

        Terminal.promptInput(promptObject.text);

        return await this.listenForReturn<Interfaces.ReturnObject>();
    }

    private static initEventHandlers(): void {
        readline.emitKeypressEvents(process.stdin)

        process.stdin.on('keypress', (str: Types.stdinOnStrParam, key: Types.stdinOnKeyParam) => {
            if (this.state == constants.STATE.LIST) {
                if (key.ctrl && key.name == 'c') {
                    Terminal.showCursor();
                    process.exit(0);
                }

                if (key.name == keymap.PREVLISTING) {
                    Terminal.prevListing();   
                }
            
                if (key.name == keymap.NEXTLISTING) {
                    Terminal.nextListing();
                }

                if (key.name == keymap.DOACTION) {
                    let listing: Interfaces.ListingObject | null = Terminal.getCurrentListing();
                    
                    if (listing) {
                        this.returnedListing = listing;

                        if (this.returnedListing.submenu || this.returnedListing.actionID == constants.TOGGLECLOSEBTNVAL) {
                            Terminal.toggleSubmenu();
                        } else if (this.returnedListing.actionID == constants.CHECKBTNVAL) {
                            Terminal.toggleCheck();
                        } else {
                            this.returnedVal = { value: this.returnedListing.value, actionID: this.returnedListing.actionID || ' ' };
                        }
                    }
                }
            }
        });

        this.rl.on('line', (line: string) => {
            if (this.state == constants.STATE.INPUT) {
                this.returnedVal = { value: line, actionID: ' ' };

                Terminal.prevLine();
                Terminal.clearLine();
            }
        });
    }

    private static listenForReturn<T>(): Promise<T> {
        return new Promise((resolve: Function) => {
            const controlLoop = (): void => {
                if (this.returnedVal) {
                    resolve(this.returnedVal);
                } else {
                    setImmediate(controlLoop);
                }
            }

            controlLoop();
        });
    }
}
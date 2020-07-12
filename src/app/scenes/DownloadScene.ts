import { 
    BAR,
    DOWNLOADING
} from '../outputs';

import Scene from './Scene';
import TitleScene from './TitleScene';

import {
    Terminal,
    Colors,
    Text,
    EventHandler,
    ProgressBar
} from '../../ui';

import App, {Entry} from '../App';
import Entries from '../modules/Entries';

export default abstract class DownloadScene extends Scene {
    private static ymargin: number;
    private static selectedEntry: Entry;
    private static entryDetailsText: string[];
    private static progressBar: ProgressBar;

    private static dir: Text = new Text('', 'none');
    private static file: Text = new Text('', 'none');

    public static show(entryIndex: number): void {
        Terminal.hideCursor();

        this.selectedEntry = App.state.entryDataArr[entryIndex];
        this.entryDetailsText = Entries.getDetails(this.selectedEntry);

        this.progressBar = new ProgressBar(BAR);

        EventHandler.attachResizeReRenderEvent(0, 'DownloadScene', this.onResize.bind(this));

        EventHandler.attachResizeReRenderEvent(0, this.dir.id, this.dir.onResize.bind(this.dir));
        EventHandler.attachResizeReRenderEvent(0, this.file.id, this.file.onResize.bind(this.file));

        this.render();
    }

    public static hide(): void {
        Terminal.showCursor();
        EventHandler.detachResizeReRenderEventMap(0, 'DownloadScene');
        EventHandler.detachResizeReRenderEventMap(0, this.dir.id);
        EventHandler.detachResizeReRenderEventMap(0, this.file.id);
        TitleScene.hide();
        this.progressBar.hide();
    }

    public static render(): void {
        this.ymargin = 0;

        TitleScene.show();

        Terminal.cursorXY(1, 5);

        for (let i: number = 0; i < this.entryDetailsText.length; i++) {
            let detail: string = this.entryDetailsText[i];
            this.ymargin += Math.floor(Colors.purify(detail).length / process.stdout.columns);
            console.log(detail);
        }
    }

    public static onResize(): void {
        this.render();
    }

    public static async waitForDownloading(): Promise<void> {
        return await App.download(this.selectedEntry.ID, (chunkLen: number, total: number, dir: string, filename: string) => {
            if (this.progressBar.total == null) {
                this.dir.setXY(2, 5 + this.ymargin + this.entryDetailsText.length + 2);
                this.dir.setText(DOWNLOADING.DIR.replace('{dir}', dir));
                this.dir.onResize();

                this.file.setXY(2, 5 + this.ymargin + this.entryDetailsText.length + 3);
                this.file.setText(DOWNLOADING.FILE.replace('{file}', filename));
                this.file.onResize();

                this.progressBar.setXY(2, 5 + this.ymargin + this.entryDetailsText.length + 4);
                this.progressBar.total = total;
            }

            this.progressBar.tick(chunkLen);
        });
    }
}

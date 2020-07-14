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

import App, { Entry } from '../App';
import Entries from '../modules/Entries';
import Downloader from '../modules/Downloader';

export default abstract class DownloadScene extends Scene {
    private static ymargin: number;
    private static selectedEntry: Entry;
    private static entryDetailsText: string[];
    private static progressBar: ProgressBar;

    private static dirhead: Text = new Text('', 'none');
    private static dir: Text = new Text('', 'none');
    private static file: Text = new Text('', 'none');

    public static show(entryIndex: number): void {
        Terminal.hideCursor();

        this.selectedEntry = App.state.entryDataArr[entryIndex];
        this.entryDetailsText = Entries.getDetails(this.selectedEntry);

        this.progressBar = new ProgressBar(BAR);

        EventHandler.attachResizeReRenderEvent(0, 'DownloadScene', this.onResize.bind(this));

        this.attachText(this.dirhead);
        this.attachText(this.dir);
        this.attachText(this.file);

        Terminal.hideCursor();
        TitleScene.show();
        this.render();
    }

    public static hide(): void {
        Terminal.showCursor();
        TitleScene.hide();

        for (let i: number = 5; i < 5 + this.entryDetailsText.length + this.ymargin; i++) {
            Terminal.cursorXY(1, i);
            Terminal.clearLine();
        }

        EventHandler.detachResizeReRenderEventMap(0, 'DownloadScene');

        this.detachText(this.dirhead);
        this.detachText(this.dir);
        this.detachText(this.file);

        this.dirhead.setText('');
        this.dir.setText('');
        this.file.setText('');
        this.progressBar.hide();
    }

    public static render(): void {
        this.ymargin = 0;

        Terminal.cursorXY(1, 5);

        for (let i: number = 0; i < this.entryDetailsText.length; i++) {
            let detail: string = this.entryDetailsText[i];
            this.ymargin += Math.floor(Colors.purify(detail).length / process.stdout.columns);
            console.log(detail);
        }

        this.dirhead.setXY(2, 5 + this.ymargin + this.entryDetailsText.length + 1);
        this.dir.setXY(2, 5 + this.ymargin + this.entryDetailsText.length + 2);
        this.file.setXY(2, 5 + this.ymargin + this.entryDetailsText.length + 3);
        this.progressBar.setXY(2, 5 + this.ymargin + this.entryDetailsText.length + 4);

        App.spinner.setXY(2, 5 + this.ymargin + this.entryDetailsText.length);
    }

    public static onResize(): void {
        this.render();
    }

    public static async waitForDownloading(): Promise<string> {
        let filename: void | string = await Downloader.download(this.selectedEntry.ID, (chunkLen: number, total: number, dir: string, filename: string) => {
            if (this.progressBar.total == null) {
                this.dirhead.setText(DOWNLOADING.DIR_HEAD);
                this.dirhead.onResize();

                this.dir.setText(DOWNLOADING.DIR_BODY.replace('{dir}', dir));
                this.dir.onResize();

                this.file.setText(DOWNLOADING.FILE.replace('{file}', filename));
                this.file.onResize();

                this.progressBar.total = total;
            }

            this.progressBar.tick(chunkLen);
        });

        return filename || '';
    }
}

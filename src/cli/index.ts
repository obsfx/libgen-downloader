import App from '../app';
import Downloader from '../app/modules/Downloader';
import BulkDownloader from '../bulk-downloader';

import {
    HELP,
    BULK,
    CONNECTION_ERROR,
    DOWNLOADING,
    BAR
} from '../app/outputs';

import { ProgressBar } from '../ui';

import minimist from 'minimist';

const cli = (argv: minimist.ParsedArgs): void => {
    if (typeof argv.help == 'boolean') {
        help();
    } else if (typeof argv.bulk == 'string') {
        bulk(argv.bulk);
    } else if (typeof argv.geturl == 'string') {
        geturl(argv.geturl);
    } else if (typeof argv.download == 'string') {
        download(argv.download);
    } else {
        startApp();
    }
}

const help = (): void => {
    HELP.forEach((e: string) => console.log(e));
    App.exit();
}

const bulk = async (filename: string): Promise<void> => {
    App.clear();
    App.createNewAppState();

    await BulkDownloader.startMD5(filename);

    if (App.state.runtimeError) {
        App.exit();
    }

    let successfullyDownloadedFileCount: number = BulkDownloader.getCompletedItemsCount();
    let allFileCount: number = BulkDownloader.getEntireItemsCount();

    let resultOutput: string = BULK.DOWNLOAD_COMPLETED
                .replace('{completed}', successfullyDownloadedFileCount.toString())
                .replace('{total}', allFileCount.toString());

    console.log(resultOutput);
    App.exit();
}

const geturl = async (md5: string): Promise<void> => {
    App.createNewAppState();

    let mirrorURL: string = await Downloader.findMirror(md5);

    if (App.state.runtimeError) {
        console.log(CONNECTION_ERROR);
        App.exit();
    }

    let URL: string = await Downloader.findDownloadURL(mirrorURL, true);

    if (App.state.runtimeError) {
        console.log(CONNECTION_ERROR);
        App.exit();
    }

    console.log(DOWNLOADING.URL, URL);
    App.exit();
}

const download = async (md5: string): Promise<void> => {
    App.createNewAppState();

    let mirrorURL: string = await Downloader.findMirror(md5);

    if (App.state.runtimeError) {
        console.log(CONNECTION_ERROR);
        App.exit();
    }

    let URL: string = await Downloader.findDownloadURL(mirrorURL, true);

    if (App.state.runtimeError) {
        console.log(CONNECTION_ERROR);
        App.exit();
    }

    let progressBar: ProgressBar = new ProgressBar(BAR, true);

    let filename: string = await Downloader.startDownloading(URL, (chunkLen: number, total: number) => {
        if (progressBar.total == null) {
            progressBar.total = total;
        }

        progressBar.tick(chunkLen);
    }, true);

    progressBar.hide();

    if (App.state.runtimeError) {
        console.log(DOWNLOADING.ERR);
        App.exit();
    }

    console.log(DOWNLOADING.COMPLETED_FILE.replace('{file}', filename));
    App.exit();
}

const startApp = (): void => {
    App.initEventHandlers();
    App.init();
}

export default cli;

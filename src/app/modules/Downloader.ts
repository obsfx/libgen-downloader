import App from '../App';

import CONSTANTS from '../constants';
import CONFIG from '../config';

import { Response } from 'node-fetch';

export default abstract class Downloader {
    public static async findMd5(entryID: string) {
        App.spinner.setSpinnerTitle('Getting MD5 Of Media.... %s');
        App.spinner.start();

        let connectionStatementSucceed: boolean = false;
        let JSONParseSucceed: boolean = false;

        let errTolarance: number = CONFIG.ERR_TOLERANCE;
        let errCounter: number = 0;

        let md5: string = '';
        let md5ReqURL: string = '';
        let md5Response: Response = new Response();

        CONSTANTS.MD5_REQ_PATTERN = '';
        while (errCounter < errTolarance && !connectionStatementSucceed) {
            md5ReqURL = CONSTANTS.MD5_REQ_PATTERN.replace('{ID}', entryID);
            md5Response = await App.getResponse(md5ReqURL);

            if (App.state.runtimeError) {
                errCounter++;
                App.spinner.setSpinnerTitle(`CONNECTION ERR ${errCounter}/${errTolarance} Getting MD5 Of Media.... %s`);
                await this.sleep(3000);

                // debug if (errCounter == 3) {
                //     CONSTANTS.MD5_REQ_PATTERN = `${CONFIG.MIRROR}json.php?ids={ID}&fields=md5`;
                // }

                App.state.runtimeError = false;
                continue;
            }

            connectionStatementSucceed = true;
        }

        if (App.state.runtimeError) {
            App.spinner.stop(true);
            return md5;
        }

        try {
            let md5ResponseJSON: [ {md5: string} ] = await md5Response.json();
            md5 = md5ResponseJSON[0].md5;

            JSONParseSucceed = true;
            App.spinner.stop(true);
        } catch(err) {
            App.spinner.stop(true);
            console.log('Invalid JSON Error', err);
        }        

        if (!JSONParseSucceed) {
            App.state.runtimeError = true;   
        }

        return md5;
    }

    private static sleep(ms: number): Promise<void> {
        return new Promise((resolve: Function) => {
            setTimeout(() => { resolve() }, ms);
        });
    }
}
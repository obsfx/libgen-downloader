import { Types } from '../types.namespace';
import { UIInterfaces } from '../../ui';

export default abstract class Main {
    private static bulkQueueHashTable: UIInterfaces.TerminalCheckedItemsHashTable | string[];
    private static downloadMode: Types.bulkDownloadMode;

    private static prepare() {
        
    }

    public static start(
        queueHashTable: UIInterfaces.TerminalCheckedItemsHashTable | string[], 
        downloadMode: Types.bulkDownloadMode): void {
        this.bulkQueueHashTable = queueHashTable;
        this.downloadMode = downloadMode;
    }
}
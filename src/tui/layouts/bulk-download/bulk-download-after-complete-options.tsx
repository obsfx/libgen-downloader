import { BulkDownloadAfterCompleteOption } from "../../../options";
import { IOption } from "../../components/option";
import { useBoundStore } from "../../store";
import { Label } from "../../../labels";
import OptionList from "../../components/option-list";

export function BulkDownloadAfterCompleteOptions() {
  const backToSearch = useBoundStore((state) => state.backToSearch);
  const resetBulkDownloadQueue = useBoundStore((state) => state.resetBulkDownloadQueue);
  const retryFailedBulkDownloads = useBoundStore((state) => state.retryFailedBulkDownloads);
  const returnToListKeepingFailedSelected = useBoundStore(
    (state) => state.returnToListKeepingFailedSelected
  );
  const failedBulkDownloadItemCount = useBoundStore((state) => state.failedBulkDownloadItemCount);
  const hasFailedDownloads = failedBulkDownloadItemCount > 0;

  const options: Record<string, IOption> = {};

  if (hasFailedDownloads) {
    options[BulkDownloadAfterCompleteOption.RETRY_FAILED_DOWNLOADS] = {
      label: `${Label.RETRY_FAILED_DOWNLOADS} (${failedBulkDownloadItemCount})`,
      onSelect: () => {
        retryFailedBulkDownloads();
      },
    };
  }

  options[BulkDownloadAfterCompleteOption.TURN_BACK_TO_THE_LIST] = {
    label: Label.TURN_BACK_TO_THE_LIST,
    onSelect: returnToListKeepingFailedSelected,
  };
  if (hasFailedDownloads) {
    options[BulkDownloadAfterCompleteOption.TURN_BACK_TO_THE_LIST].label =
      Label.TURN_BACK_TO_THE_LIST_KEEPING_FAILED;
  }

  options[BulkDownloadAfterCompleteOption.BACK_TO_SEARCH] = {
    label: Label.SEARCH,
    onSelect: () => {
      resetBulkDownloadQueue();
      backToSearch();
    },
  };

  return <OptionList options={options} />;
}

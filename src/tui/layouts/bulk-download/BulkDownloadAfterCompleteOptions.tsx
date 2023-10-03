import React from "react";
import { BulkDownloadAfterCompleteOption } from "../../../options";
import { IOption } from "../../components/Option";
import { useBoundStore } from "../../store/index";
import Label from "../../../labels";
import { LAYOUT_KEY } from "../keys";
import OptionList from "../../components/OptionList";

export function BulkDownloadAfterCompleteOptions() {
  const setActiveLayout = useBoundStore((state) => state.setActiveLayout);
  const backToSearch = useBoundStore((state) => state.backToSearch);
  const resetBulkDownloadQueue = useBoundStore((state) => state.resetBulkDownloadQueue);

  const options: Record<string, IOption> = {
    [BulkDownloadAfterCompleteOption.TURN_BACK_TO_THE_LIST]: {
      label: Label.TURN_BACK_TO_THE_LIST,
      onSelect: () => {
        resetBulkDownloadQueue();
        setActiveLayout(LAYOUT_KEY.RESULT_LIST_LAYOUT);
      },
    },

    [BulkDownloadAfterCompleteOption.BACK_TO_SEARCH]: {
      label: Label.SEARCH,
      onSelect: () => {
        resetBulkDownloadQueue();
        backToSearch();
      },
    },
  };

  return <OptionList options={options} />;
}

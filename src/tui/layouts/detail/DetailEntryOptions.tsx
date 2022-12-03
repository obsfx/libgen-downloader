import React, { useState } from "react";
import { Box, Text, useInput, Key } from "ink";
import { useAppContext } from "../../contexts/AppContext";
import { IOption } from "../../components/Option";
import OptionList from "../../components/OptionList";
import { DetailOptions, ListEntryOptions, RESULT_LIST_LAYOUT } from "../../../constants";
import { useLayoutContext } from "../../contexts/LayoutContext";

const DetailEntryOptions: React.FC = () => {
  const { detailedEntry, setDetailedEntry } = useAppContext();
  const { setActiveLayout } = useLayoutContext();

  const detailOptions: Record<string, IOption> = {
    [DetailOptions.TURN_BACK_TO_THE_LIST.id]: {
      label: DetailOptions.TURN_BACK_TO_THE_LIST.label,
      onSelect: () => {
        setActiveLayout(RESULT_LIST_LAYOUT);
        setDetailedEntry(null);
      },
    },
    [DetailOptions.DOWNLOAD_DIRECTLY.id]: {
      label: DetailOptions.DOWNLOAD_DIRECTLY.label,
      onSelect: () => undefined,
    },
    [DetailOptions.ALTERNATIVE_DOWNLOADS.id]: {
      label: DetailOptions.ALTERNATIVE_DOWNLOADS.label,
      onSelect: () => setShowAlternativeDownloads(true),
    },
    [DetailOptions.ADD_TO_BULK_DOWNLOAD_QUEUE.id]: {
      label: DetailOptions.ADD_TO_BULK_DOWNLOAD_QUEUE.label,
      onSelect: () => undefined,
    },
  };

  const [showAlternativeDownloads, setShowAlternativeDownloads] = useState(false);
  const alternativeDownloadOptions: Record<string, IOption> = {
    ...(detailedEntry?.downloadUrls || []).reduce<Record<string, IOption>>((prev, current, idx) => {
      return {
        ...prev,
        [idx]: {
          label: `(Mirror ${idx + 1}) ${current}`,
          onSelect: () => undefined,
        },
      };
    }, {}),
    [ListEntryOptions.BACK_TO_ENTRY_OPTIONS.id]: {
      label: ListEntryOptions.BACK_TO_ENTRY_OPTIONS.label,
      onSelect: () => setShowAlternativeDownloads(false),
    },
  };

  if (!detailedEntry) {
    return null;
  }

  return showAlternativeDownloads ? (
    <OptionList key={"alternativeDownloadOptions"} options={alternativeDownloadOptions} />
  ) : (
    <OptionList key={"detailOptions"} options={detailOptions} />
  );
};

export default DetailEntryOptions;

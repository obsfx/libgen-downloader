import React, { useState } from "react";
import { IOption } from "../../components/Option";
import OptionList from "../../components/OptionList";
import { DetailEntryOption } from "../../../options";
import Label from "../../../labels";
import { LAYOUT_KEY } from "../keys";
import { useLayoutContext } from "../../contexts/LayoutContext";
import { StandardDownloadManager } from "../../classes/StandardDownloadManager";
import { useDownloadContext } from "../../contexts/DownloadContext";
import { useAtom } from "jotai";
import { detailedEntryAtom } from "../../store/app";

const DetailEntryOptions: React.FC = () => {
  const { downloadQueueMap } = useDownloadContext();
  const [detailedEntry, setDetailedEntry] = useAtom(detailedEntryAtom);
  const { setActiveLayout } = useLayoutContext();

  const inDownloadQueue = detailedEntry ? !!downloadQueueMap[detailedEntry.id] : false;

  const detailOptions: Record<string, IOption> = {
    [DetailEntryOption.TURN_BACK_TO_THE_LIST]: {
      label: Label.TURN_BACK_TO_THE_LIST,
      onSelect: () => {
        setActiveLayout(LAYOUT_KEY.RESULT_LIST_LAYOUT);
        setDetailedEntry(null);
      },
    },
    [DetailEntryOption.DOWNLOAD_DIRECTLY]: {
      loading: inDownloadQueue,
      label: inDownloadQueue ? Label.DOWNLOADING : Label.DOWNLOAD_DIRECTLY,
      onSelect: () => {
        if (detailedEntry) {
          StandardDownloadManager.pushToDownloadQueueMap(detailedEntry);
        }
      },
    },
    [DetailEntryOption.ALTERNATIVE_DOWNLOADS]: {
      loading: inDownloadQueue,
      label: Label.ALTERNATIVE_DOWNLOADS,
      onSelect: () => setShowAlternativeDownloads(true),
    },
    [DetailEntryOption.BULK_DOWNLOAD_QUEUE]: {
      label: Label.ADD_TO_BULK_DOWNLOAD_QUEUE,
      onSelect: () => undefined,
    },
  };

  const [showAlternativeDownloads, setShowAlternativeDownloads] = useState(false);
  const alternativeDownloadOptions: Record<string, IOption> = {
    ...(detailedEntry?.downloadUrls || []).reduce<Record<string, IOption>>((prev, current, idx) => {
      return {
        ...prev,
        [idx]: {
          label: `(${idx + 1}) ${current}`,
          onSelect: () => {
            if (detailedEntry) {
              StandardDownloadManager.pushToDownloadQueueMap({
                ...detailedEntry,
                alternativeDirectDownloadUrl: current,
              });

              setShowAlternativeDownloads(false);
            }
          },
        },
      };
    }, {}),
    [DetailEntryOption.BACK_TO_ENTRY_OPTIONS]: {
      label: Label.BACK_TO_ENTRY_OPTIONS,
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

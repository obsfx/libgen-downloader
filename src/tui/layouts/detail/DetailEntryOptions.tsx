import React, { useEffect, useState } from "react";
import { IOption } from "../../components/Option.js";
import OptionList from "../../components/OptionList.js";
import { DetailEntryOption } from "../../../options.js";
import Label from "../../../labels.js";
import { LAYOUT_KEY } from "../keys.js";
import { useBoundStore } from "../../store/index.js";
import { useInput } from "ink";

const DetailEntryOptions: React.FC = () => {
  const detailedEntry = useBoundStore((state) => state.detailedEntry);
  const setDetailedEntry = useBoundStore((state) => state.setDetailedEntry);
  const setActiveLayout = useBoundStore((state) => state.setActiveLayout);
  const pushDownloadQueue = useBoundStore((state) => state.pushDownloadQueue);
  const addToBulkDownloadQueue = useBoundStore((state) => state.addToBulkDownloadQueue);
  const removeFromBulkDownloadQueue = useBoundStore((state) => state.removeFromBulkDownloadQueue);
  const fetchEntryAlternativeDownloadURLs = useBoundStore(
    (state) => state.fetchEntryAlternativeDownloadURLs
  );

  const inDownloadQueueEntryIds = useBoundStore((state) => state.inDownloadQueueEntryIds);
  const inDownloadQueue = detailedEntry
    ? inDownloadQueueEntryIds.includes(detailedEntry.id)
    : false;

  const bulkDownloadSelectedEntryIds = useBoundStore((state) => state.bulkDownloadSelectedEntryIds);
  const inBulkDownloadQueue = detailedEntry
    ? bulkDownloadSelectedEntryIds.includes(detailedEntry.id)
    : false;

  const [alternativeDownloadURLs, setAlternativeDownloadURLs] = useState<string[]>([]);
  const [alternativeDownloadURLsLoading, setAlternativeDownloadURLsLoading] = useState(false);

  useEffect(() => {
    if (!detailedEntry) {
      return;
    }

    const fetchDownloadUrls = async () => {
      setAlternativeDownloadURLsLoading(true);
      const alternativeDownloadURLs = await fetchEntryAlternativeDownloadURLs(detailedEntry);
      setAlternativeDownloadURLs(alternativeDownloadURLs);
      setAlternativeDownloadURLsLoading(false);
    };

    fetchDownloadUrls();
  }, []);

  const toggleBulkDownload = () => {
    if (!detailedEntry) {
      return;
    }

    if (inBulkDownloadQueue) {
      removeFromBulkDownloadQueue(detailedEntry.id);
      return;
    }

    addToBulkDownloadQueue(detailedEntry);
  };

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
          pushDownloadQueue(detailedEntry);
        }
      },
    },
    [DetailEntryOption.ALTERNATIVE_DOWNLOADS]: {
      loading: alternativeDownloadURLsLoading || inDownloadQueue,
      label: `${Label.ALTERNATIVE_DOWNLOADS} (${alternativeDownloadURLs.length})`,
      onSelect: () => setShowAlternativeDownloads(true),
    },
    [DetailEntryOption.BULK_DOWNLOAD_QUEUE]: {
      label: inBulkDownloadQueue
        ? Label.REMOVE_FROM_BULK_DOWNLOAD_QUEUE
        : Label.ADD_TO_BULK_DOWNLOAD_QUEUE,
      onSelect: () => {
        toggleBulkDownload();
      },
    },
  };

  const [showAlternativeDownloads, setShowAlternativeDownloads] = useState(false);
  const alternativeDownloadOptions: Record<string, IOption> = {
    ...alternativeDownloadURLs.reduce<Record<string, IOption>>((prev, current, idx) => {
      return {
        ...prev,
        [idx]: {
          label: `(${idx + 1}) ${current}`,
          onSelect: () => {
            if (detailedEntry) {
              pushDownloadQueue({
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

  useInput((input, key) => {
    if (key.tab) {
      toggleBulkDownload();
      return;
    }

    if (input.toLowerCase() === "d" && detailedEntry) {
      pushDownloadQueue(detailedEntry);
      return;
    }
  });

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

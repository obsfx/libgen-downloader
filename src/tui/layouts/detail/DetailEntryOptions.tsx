import React from "react";
import { Box, Text, useInput } from "ink";
import figures from "figures";
import { IOption } from "../../components/Option";
import OptionList from "../../components/OptionList";
import { DetailEntryOption } from "../../../options";
import Label from "../../../labels";
import { LAYOUT_KEY } from "../keys";
import { useBoundStore } from "../../store";
import objectHash from "object-hash";

const DetailEntryOptions: React.FC = () => {
  const detailedEntry = useBoundStore((state) => state.detailedEntry);
  const setDetailedEntry = useBoundStore((state) => state.setDetailedEntry);
  const setActiveLayout = useBoundStore((state) => state.setActiveLayout);
  const pushDownloadQueue = useBoundStore((state) => state.pushDownloadQueue);
  const addToBulkDownloadQueue = useBoundStore((state) => state.addToBulkDownloadQueue);
  const removeFromBulkDownloadQueue = useBoundStore((state) => state.removeFromBulkDownloadQueue);

  const inDownloadQueueEntryIds = useBoundStore((state) => state.inDownloadQueueEntryIds);
  const inDownloadQueue = detailedEntry
    ? inDownloadQueueEntryIds.includes(detailedEntry.id)
    : false;

  const bulkDownloadSelectedEntries = useBoundStore((state) => state.bulkDownloadSelectedEntries);
  const inBulkDownloadQueue = detailedEntry
    ? bulkDownloadSelectedEntries[objectHash(detailedEntry)]
    : false;

  const toggleBulkDownload = () => {
    if (!detailedEntry) {
      return;
    }

    if (inBulkDownloadQueue) {
      removeFromBulkDownloadQueue(detailedEntry);
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
      description: "(Press [D])",
      onSelect: () => {
        if (detailedEntry) {
          pushDownloadQueue(detailedEntry);
        }
      },
    },
    [DetailEntryOption.BULK_DOWNLOAD_QUEUE]: {
      label: inBulkDownloadQueue
        ? Label.REMOVE_FROM_BULK_DOWNLOAD_QUEUE
        : Label.ADD_TO_BULK_DOWNLOAD_QUEUE,
      description: "(Press [TAB])",
      onSelect: () => {
        toggleBulkDownload();
      },
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

  return (
    <>
      <Box paddingLeft={3} height={1}>
        {inBulkDownloadQueue && (
          <Text color="green">
            {figures.tick} {Label.ADDED_TO_BULK_DOWNLOAD_QUEUE}
          </Text>
        )}
      </Box>
      <OptionList key={"detailOptions"} options={detailOptions} />
    </>
  );
};

export default DetailEntryOptions;

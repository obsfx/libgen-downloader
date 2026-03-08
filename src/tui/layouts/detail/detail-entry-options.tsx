import type { FC } from "react";
import { Box, Text, useInput } from "ink";
import figures from "figures";
import { IOption } from "../../components/option";
import OptionList from "../../components/option-list";
import { DetailEntryOption } from "../../../options";
import Label from "../../../labels";
import { LAYOUT_KEY } from "../keys";
import { useBoundStore } from "../../store";
import objectHash from "object-hash";

const DetailEntryOptions: FC = () => {
  const detailedEntry = useBoundStore((state) => state.detailedEntry);
  const setDetailedEntry = useBoundStore((state) => state.setDetailedEntry);
  const setActiveLayout = useBoundStore((state) => state.setActiveLayout);
  const pushDownloadQueue = useBoundStore((state) => state.pushDownloadQueue);
  const addToBulkDownloadQueue = useBoundStore((state) => state.addToBulkDownloadQueue);
  const removeFromBulkDownloadQueue = useBoundStore((state) => state.removeFromBulkDownloadQueue);

  const inDownloadQueueEntryIds = useBoundStore((state) => state.inDownloadQueueEntryIds);
  let inDownloadQueue = false;
  if (detailedEntry) {
    inDownloadQueue = inDownloadQueueEntryIds.includes(detailedEntry.id);
  }

  const bulkDownloadSelectedEntries = useBoundStore((state) => state.bulkDownloadSelectedEntries);
  let inBulkDownloadQueue = false;
  if (detailedEntry) {
    inBulkDownloadQueue = !!bulkDownloadSelectedEntries[objectHash(detailedEntry)];
  }

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

  let downloadLabel = Label.DOWNLOAD_DIRECTLY;
  if (inDownloadQueue) {
    downloadLabel = Label.DOWNLOADING;
  }

  let bulkDownloadLabel = Label.ADD_TO_BULK_DOWNLOAD_QUEUE;
  if (inBulkDownloadQueue) {
    bulkDownloadLabel = Label.REMOVE_FROM_BULK_DOWNLOAD_QUEUE;
  }

  const detailOptions: Record<string, IOption> = {
    [DetailEntryOption.TURN_BACK_TO_THE_LIST]: {
      label: Label.TURN_BACK_TO_THE_LIST,
      onSelect: () => {
        setActiveLayout(LAYOUT_KEY.RESULT_LIST_LAYOUT);
        setDetailedEntry(undefined);
      },
    },
    [DetailEntryOption.DOWNLOAD_DIRECTLY]: {
      loading: inDownloadQueue,
      label: downloadLabel,
      description: "(Press [D])",
      onSelect: () => {
        if (detailedEntry) {
          pushDownloadQueue(detailedEntry);
        }
      },
    },
    [DetailEntryOption.BULK_DOWNLOAD_QUEUE]: {
      label: bulkDownloadLabel,
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
    return;
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

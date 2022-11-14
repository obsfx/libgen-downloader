import React, { useState } from "react";
import { Box, Text, useInput, Key } from "ink";
import { useAppContext } from "../../contexts/AppContext";
import { IOption } from "../../components/Option";
import OptionList from "../../components/OptionList";
import { DetailOptions } from "../../../constants";

const DetailEntryOptions: React.FC<{}> = ({}) => {
  const { detailedEntry } = useAppContext();

  const [detailOptions, setDetailOptions] = useState<Record<string, IOption>>({
    [DetailOptions.TURN_BACK_TO_THE_LIST.id]: {
      label: DetailOptions.TURN_BACK_TO_THE_LIST.label,
      onSelect: () => undefined,
    },
    [DetailOptions.DOWNLOAD_DIRECTLY.id]: {
      label: DetailOptions.DOWNLOAD_DIRECTLY.label,
      onSelect: () => undefined,
    },
    [DetailOptions.ALTERNATIVE_DOWNLOADS.id]: {
      label: DetailOptions.ALTERNATIVE_DOWNLOADS.label,
      onSelect: () => undefined,
    },
    [DetailOptions.ADD_TO_BULK_DOWNLOAD_QUEUE.id]: {
      label: DetailOptions.ADD_TO_BULK_DOWNLOAD_QUEUE.label,
      onSelect: () => undefined,
    },
  });

  if (!detailedEntry) {
    return null;
  }

  console.log(detailedEntry);

  return <OptionList key={"detailOptions"} options={detailOptions} />;
};

export default DetailEntryOptions;

import React, { useCallback, useEffect, useState } from "react";
import { Box, Text, useInput, Key } from "ink";
import figures from "figures";
import { ResultListItemEntry, ResultListItemOption } from "../../../api/models/ListItem";
import { attempt, createOptionItem } from "../../../utils";
import { ListEntryOptions } from "../../../constants";
import { useErrorContext } from "../../contexts/ErrorContext";
import { useLogContext } from "../../contexts/LogContext";
import { getDocument } from "../../../api/data/document";
import { parseDownloadUrls } from "../../../api/data/url";
import { useResultListContext } from "../../contexts/ResultListContext";
import ResultListItemEntryOptions from "./ResultListItemEntryOptions";

const ResultListItemEntry: React.FC<{
  item: ResultListItemEntry;
  isActive: boolean;
  isExpanded: boolean;
  isFadedOut: boolean;
}> = ({ item, isActive, isExpanded, isFadedOut }) => {
  const { setAnyEntryExpanded } = useResultListContext();

  const { throwError } = useErrorContext();
  const { pushLog } = useLogContext();

  useInput(
    (_, key: Key) => {
      if (key.return) {
        setAnyEntryExpanded(true);
      }
    },
    { isActive: isActive && !isExpanded }
  );

  const [downloadUrls, setDownloadUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!isExpanded) {
      return;
    }
    const fetchDownloadUrls = async () => {
      const pageDocument = await attempt(() => getDocument(item.data.mirror), pushLog, throwError);

      if (!pageDocument) {
        return;
      }

      const parsedDownloadUrls = parseDownloadUrls(pageDocument, throwError);

      if (parsedDownloadUrls) {
        setDownloadUrls(parsedDownloadUrls);
      }
    };

    fetchDownloadUrls();
  }, [isExpanded, item.data.mirror, pushLog, throwError]);

  return (
    <Box flexDirection="column" paddingLeft={isExpanded ? 1 : 0}>
      <Text
        wrap="truncate"
        color={isFadedOut ? "gray" : isExpanded ? "cyanBright" : isActive ? "yellow" : ""}
        bold={isActive}
      >
        {isActive && !isExpanded && figures.pointer} [{item.order}] [{item.data.extension}]{" "}
        {item.data.title}
      </Text>

      {isExpanded && <ResultListItemEntryOptions />}

      {isExpanded &&
        downloadUrls.map((url, idx) => (
          <Text key={idx} wrap="truncate">
            {url}
          </Text>
        ))}
    </Box>
  );
};

export default ResultListItemEntry;

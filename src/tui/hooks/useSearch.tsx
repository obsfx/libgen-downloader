import { useCallback } from "react";
import { constructSearchURL, parseEntries } from "../../api/data/search";
import { getDocument } from "../../api/data/document";
import { SEARCH_PAGE_SIZE } from "../../settings";
import { attempt } from "../../utils";
import { useConfigContext } from "../contexts/ConfigContext";
import { useErrorContext } from "../contexts/ErrorContext";
import { useLogContext } from "../contexts/LogContext";

export const useSearch = () => {
  const { config, mirror } = useConfigContext();
  const { throwError } = useErrorContext();
  const { pushLog, clearLog } = useLogContext();

  const fetchEntries = useCallback(
    async (query: string, pageNumber: number) => {
      const searchURL = constructSearchURL({
        query,
        mirror,
        pageNumber,
        pageSize: SEARCH_PAGE_SIZE,
        searchReqPattern: config.searchReqPattern,
      });
      const pageDocument = await attempt(
        () => getDocument(searchURL),
        pushLog,
        throwError,
        clearLog
      );
      if (!pageDocument) {
        return [];
      }
      const entries = parseEntries(pageDocument, throwError) || [];
      return entries;
    },
    [config.searchReqPattern, mirror, pushLog, clearLog, throwError]
  );

  const search = useCallback(
    async (query: string, currentPage: number) => {
      const entries = await fetchEntries(query, currentPage);
      return entries;
    },
    [fetchEntries]
  );

  return { search };
};

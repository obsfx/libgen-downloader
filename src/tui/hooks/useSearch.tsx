import { useCallback } from "react";

import { constructSearchURL, getDocument, parseEntries } from "../../api/data/search";
import { GETTING_RESULTS } from "../../constants/messages";
import { SEARCH_PAGE_SIZE } from "../../settings";
import { attempt } from "../../utils";
import { useConfigContext } from "../contexts/ConfigContext";
import { useErrorContext } from "../contexts/ErrorContext";
import { useLoaderContext } from "../contexts/LoaderContext";
import { useLogContext } from "../contexts/LogContext";

export const useSearch = () => {
  const { config, mirror } = useConfigContext();
  const { throwError } = useErrorContext();
  const { pushLog } = useLogContext();
  const { setIsLoading, setLoaderMessage } = useLoaderContext();

  const search = useCallback(
    async (query: string, currentPage: number) => {
      setIsLoading(true);
      setLoaderMessage(GETTING_RESULTS);

      const searchURL = constructSearchURL({
        query,
        mirror,
        pageNumber: currentPage,
        pageSize: SEARCH_PAGE_SIZE,
        searchReqPattern: config.searchReqPattern,
      });

      const pageDocument = await attempt(() => getDocument(searchURL), pushLog, throwError);

      if (!pageDocument) {
        return;
      }

      const entries = parseEntries(pageDocument);
      setIsLoading(false);

      return entries;
    },
    [mirror, config.searchReqPattern, pushLog, throwError, setIsLoading, setLoaderMessage]
  );

  return { search };
};

import type { FC } from "react";
import { Box } from "ink";

import SearchInputMain from "./search-input/index";
import { useBoundStore } from "../../store";
import { LoadingSpinner } from "../../components/loading-spinner";

const Search: FC = () => {
  const isLoading = useBoundStore((state) => state.isLoading);
  const loaderMessage = useBoundStore((state) => state.loaderMessage);

  if (isLoading) {
    return <LoadingSpinner message={loaderMessage} />;
  }

  return (
    <Box flexDirection="column">
      <SearchInputMain />
    </Box>
  );
};

export default Search;

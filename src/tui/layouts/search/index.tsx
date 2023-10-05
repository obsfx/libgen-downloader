import React from "react";
import { Box } from "ink";

import SearchInputMain from "./search-input/index";
import { useBoundStore } from "../../store/index";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { SearchBy } from "./search-by/index";

const Search: React.FC = () => {
  const isLoading = useBoundStore((state) => state.isLoading);
  const loaderMessage = useBoundStore((state) => state.loaderMessage);

  if (isLoading) {
    return <LoadingSpinner message={loaderMessage} />;
  }

  return (
    <Box flexDirection="column">
      <SearchInputMain />
      <SearchBy />
    </Box>
  );
};

export default Search;

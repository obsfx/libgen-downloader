import React from "react";
import { Box } from "ink";

import SearchInputMain from "./search-input/index.js";
import SearchFilter from "./search-filter/index.js";
import { useBoundStore } from "../../store/index.js";
import { LoadingSpinner } from "../../components/LoadingSpinner.js";

const Search: React.FC = () => {
  const isLoading = useBoundStore((state) => state.isLoading);
  const loaderMessage = useBoundStore((state) => state.loaderMessage);

  if (isLoading) {
    return <LoadingSpinner message={loaderMessage} />;
  }

  return (
    <Box flexDirection="column">
      <SearchInputMain />
      <SearchFilter />
    </Box>
  );
};

export default Search;

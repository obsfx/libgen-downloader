import React from "react";
import { Box } from "ink";

import SearchInputMain from "./search-input/index.js";
import { useBoundStore } from "../../store/index.js";
import { LoadingSpinner } from "../../components/LoadingSpinner.js";
import { SearchBy } from "./search-by/index.js";
import ExpandableSection from "../../components/ExpandableSection.js";

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

import React from "react";
import { Box } from "ink";

import SearchInputMain from "./search-input";
import SearchFilter from "./search-filter";

const Search: React.FC = () => {
  return (
    <Box flexDirection="column">
      <SearchInputMain />
      <SearchFilter />
    </Box>
  );
};

export default Search;

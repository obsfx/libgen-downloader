import React from "react";
import { Box } from "ink";

import SearchInputMain from "./search-input/index.js";
import SearchFilter from "./search-filter/index.js";

const Search: React.FC = () => {
  return (
    <Box flexDirection="column">
      <SearchInputMain />
      <SearchFilter />
    </Box>
  );
};

export default Search;

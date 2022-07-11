import React from "react";
import { Box } from "ink";

import SearchInput from "./search-input";
import SearchFilter from "./search-filter";

const Search: React.FC = () => {
  return (
    <Box flexDirection="column">
      <SearchInput />
      <SearchFilter />
    </Box>
  );
};

export default Search;

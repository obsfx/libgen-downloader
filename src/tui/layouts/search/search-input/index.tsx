import React from "react";
import { Box } from "ink";

import SearchWarning from "./SearchWarning";
import SearchInput from "./SearchInput";

const SearchInputMain: React.FC = () => {
  return (
    <Box flexDirection="column">
      <SearchWarning />
      <SearchInput />
    </Box>
  );
};

export default SearchInputMain;

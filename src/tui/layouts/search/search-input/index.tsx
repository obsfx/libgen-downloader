import React from "react";
import { Box } from "ink";

import SearchInfo from "./SearchInfo.js";
import SearchWarning from "./SearchWarning.js";
import SearchInput from "./SearchInput.js";

const SearchInputMain: React.FC = () => {
  return (
    <Box flexDirection="column">
      <SearchInfo />
      <SearchWarning />
      <SearchInput />
    </Box>
  );
};

export default SearchInputMain;

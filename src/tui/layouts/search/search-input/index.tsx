import React from "react";
import { Box } from "ink";

import SearchInfo from "./SearchInfo";
import SearchWarning from "./SearchWarning";
import SearchInput from "./SearchInput";

const SearchInputMain: React.FC = () => {
  console.log("SearchInputMain");

  return (
    <Box flexDirection="column">
      <SearchInfo />
      <SearchWarning />
      <SearchInput />
    </Box>
  );
};

export default SearchInputMain;

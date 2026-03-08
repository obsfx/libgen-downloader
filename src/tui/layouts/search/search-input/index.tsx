import type { FC } from "react";
import { Box } from "ink";

import SearchWarning from "./search-warning";
import SearchInput from "./search-input";

const SearchInputMain: FC = () => {
  return (
    <Box flexDirection="column">
      <SearchWarning />
      <SearchInput />
    </Box>
  );
};

export default SearchInputMain;

import React from "react";
import { Text } from "ink";

import { SEARCH_MIN_CHAR } from "../../../../constants";
import { useBoundStore } from "../../../store/index";

const SearchWarning: React.FC = () => {
  const showSearchMinCharWarning = useBoundStore((state) => state.showSearchMinCharWarning);

  if (!showSearchMinCharWarning) {
    return null;
  }

  return (
    <Text color="yellow" wrap="truncate">
      Search string must contain minimum {SEARCH_MIN_CHAR} characters.
    </Text>
  );
};

export default SearchWarning;

import React from "react";
import { Text } from "ink";

import { SEARCH_MIN_CHAR } from "../../../../constants";
import { useAppStateContext } from "../../../contexts/AppStateContext";

const SearchWarning: React.FC = () => {
  const { showSearchMinCharWarning } = useAppStateContext();

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

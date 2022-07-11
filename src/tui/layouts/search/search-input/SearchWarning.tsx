import React from "react";
import { Text } from "ink";

import { useAppContext } from "../../../contexts/AppContext";
import { SEARCH_MIN_CHAR } from "../../../../constants/options";

const SearchWarning: React.FC = () => {
  const { showSearchMinCharWarning } = useAppContext();

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

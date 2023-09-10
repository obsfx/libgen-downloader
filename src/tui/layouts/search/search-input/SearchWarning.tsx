import React from "react";
import { Text } from "ink";

import { SEARCH_MIN_CHAR } from "../../../../constants";
import { useAtom } from "jotai";
import { showSearchMinCharWarningAtom } from "../../../store/app";

const SearchWarning: React.FC = () => {
  const [showSearchMinCharWarning] = useAtom(showSearchMinCharWarningAtom);

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

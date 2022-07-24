import React, { useCallback, useEffect } from "react";
import { useFocus, useFocusManager } from "ink";

import Input from "../../../components/Input";
import { useAppContext } from "../../../contexts/AppContext";
import { useLayoutContext } from "../../../contexts/LayoutContext";
import { SEARCH_MIN_CHAR } from "../../../../constants/options";
import { RESULT_LIST_LAYOUT, RESULT_LIST_FOCUS_ID } from "../../../../constants/layouts";

const SearchInput: React.FC = () => {
  const {
    searchValue,
    setSearchValue,
    showSearchMinCharWarning,
    setShowSearchMinCharWarning,
    handleSearch,
  } = useAppContext();

  const { setActiveLayout } = useLayoutContext();

  const { isFocused } = useFocus({ autoFocus: true });
  const { focus } = useFocusManager();

  const handleSubmit = useCallback(async () => {
    if (searchValue.length < SEARCH_MIN_CHAR) {
      setShowSearchMinCharWarning(true);
      return;
    }

    await handleSearch(searchValue);
    setActiveLayout(RESULT_LIST_LAYOUT);
    focus(RESULT_LIST_FOCUS_ID);
  }, [searchValue, setShowSearchMinCharWarning, handleSearch, setActiveLayout, focus]);

  useEffect(() => {
    if (showSearchMinCharWarning && searchValue.length >= SEARCH_MIN_CHAR) {
      setShowSearchMinCharWarning(false);
    }
  }, [searchValue, showSearchMinCharWarning, setShowSearchMinCharWarning]);
  return (
    <Input
      label="Search"
      placeholder={`Search string must contain minimum ${SEARCH_MIN_CHAR} characters.`}
      isFocused={isFocused}
      searchValue={searchValue}
      onSearchValueChange={setSearchValue}
      onSubmit={handleSubmit}
    />
  );
};

export default SearchInput;

import React, { useCallback, useEffect } from "react";
import { useFocus } from "ink";

import Input from "../../../components/Input";
import { useAppContext } from "../../../contexts/AppContext";
import { SEARCH_MIN_CHAR } from "../../../../constants/options";

const SearchInput: React.FC = () => {
  const {
    searchValue,
    setSearchValue,
    showSearchMinCharWarning,
    setShowSearchMinCharWarning,
    handleSearch,
  } = useAppContext();

  const { isFocused } = useFocus({ autoFocus: true });

  const handleSubmit = useCallback(() => {
    if (searchValue.length < SEARCH_MIN_CHAR) {
      setShowSearchMinCharWarning(true);
      return;
    }

    handleSearch(searchValue);
  }, [searchValue, setShowSearchMinCharWarning, handleSearch]);

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

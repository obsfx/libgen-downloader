import React from "react";
import Input from "../../../components/Input";
import { SEARCH_MIN_CHAR } from "../../../../constants";
import { useBoundStore } from "../../../store/index";
import { useFocus } from "ink";

const SearchInput: React.FC = () => {
  const searchValue = useBoundStore((state) => state.searchValue);
  const setSearchValue = useBoundStore((state) => state.setSearchValue);
  const handleSearchSubmit = useBoundStore((state) => state.handleSearchSubmit);

  const { isFocused } = useFocus({ autoFocus: true });

  const handleInputOnSubmit = () => {
    if (!isFocused) {
      return;
    }

    handleSearchSubmit();
  };

  return (
    <Input
      label="Search"
      placeholder={`Search string must contain minimum ${SEARCH_MIN_CHAR} characters.`}
      isFocused={isFocused}
      searchValue={searchValue}
      onSearchValueChange={setSearchValue}
      onSubmit={handleInputOnSubmit}
    />
  );
};

export default SearchInput;

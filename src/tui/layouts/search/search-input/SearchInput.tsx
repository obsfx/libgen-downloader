import React from "react";
import Input from "../../../components/Input.js";
import { SEARCH_MIN_CHAR } from "../../../../constants.js";
import { useBoundStore } from "../../../store/index.js";

const SearchInput: React.FC = () => {
  const searchValue = useBoundStore((state) => state.searchValue);
  const setSearchValue = useBoundStore((state) => state.setSearchValue);
  const handleSearchSubmit = useBoundStore((state) => state.handleSearchSubmit);

  return (
    <Input
      label="Search"
      placeholder={`Search string must contain minimum ${SEARCH_MIN_CHAR} characters.`}
      isFocused={true}
      searchValue={searchValue}
      onSearchValueChange={setSearchValue}
      onSubmit={handleSearchSubmit}
    />
  );
};

export default SearchInput;

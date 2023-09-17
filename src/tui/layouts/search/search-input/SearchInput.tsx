import React from "react";
import Input from "../../../components/Input";
import { SEARCH_MIN_CHAR } from "../../../../constants";
import { useBoundStore } from "../../../store";

const SearchInput: React.FC = () => {
  const searchValue = useBoundStore((state) => state.searchValue);
  const setSearchValue = useBoundStore((state) => state.setSearchValue);
  const currentPage = useBoundStore((state) => state.currentPage);
  const search = useBoundStore((state) => state.search);

  const handleSubmit = async () => {
    if (searchValue.length < SEARCH_MIN_CHAR) {
      return;
    }
    search(searchValue, currentPage);
  };

  return (
    <Input
      label="Search"
      placeholder={`Search string must contain minimum ${SEARCH_MIN_CHAR} characters.`}
      isFocused={true}
      searchValue={searchValue}
      onSearchValueChange={setSearchValue}
      onSubmit={handleSubmit}
    />
  );
};

export default SearchInput;

import React from "react";
import Input from "../../../components/Input";
import { SEARCH_MIN_CHAR } from "../../../../constants";
import { useBearStore, useBoundStore } from "../../../store";

const SearchInput: React.FC = () => {
  const searchValue = useBoundStore((state) => state.currentPage);
  const setSearchValue = useBoundStore((state) => state.setSearchValue);
  const currentPage = useBoundStore((state) => state.currentPage);
  const search = useBoundStore((state) => state.search);

  const bear = useBearStore((state) => state.bears);
  const inc = useBearStore((state) => state.increase);

  //const handleSubmit = () => {
  //  //if (searchValue.length < SEARCH_MIN_CHAR) {
  //  //  return;
  //  //}
  //  //search(searchValue, currentPage);
  //};

  console.log("SearchInput", { bear, inc });
  return (
    <Input
      label="Search"
      placeholder={`Search string must contain minimum ${SEARCH_MIN_CHAR} characters.`}
      isFocused={true}
      searchValue={searchValue.toString()}
      onSearchValueChange={(val) => inc(1)}
      onSubmit={() => {
        console.log("SearchInput", { searchValue, currentPage });
      }}
    />
  );
};

export default SearchInput;

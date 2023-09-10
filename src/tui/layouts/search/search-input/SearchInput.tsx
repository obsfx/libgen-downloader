import React, { useCallback } from "react";
import { useAtom } from "jotai";
import Input from "../../../components/Input";
import { SEARCH_MIN_CHAR } from "../../../../constants";
import { searchValueAtom } from "../../../store/app";
import { AppEvent, EventManager } from "../../../classes/EventEmitterManager";

const SearchInput: React.FC = () => {
  const [searchValue, setSearchValue] = useAtom(searchValueAtom);

  const handleSubmit = useCallback(async () => {
    if (searchValue.length < SEARCH_MIN_CHAR) {
      return;
    }

    EventManager.emit(AppEvent.SEARCH);
  }, [searchValue]);

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

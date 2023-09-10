import React, { useCallback, useEffect } from "react";
import { useFocus } from "ink";

import Input from "../../../components/Input";
import { useAppActionContext } from "../../../contexts/AppActionContext";
import { useLayoutContext } from "../../../contexts/LayoutContext";
import { SEARCH_MIN_CHAR } from "../../../../constants";
import { LAYOUT_KEY } from "../../keys";
import { useAtom } from "jotai";
import { searchValueAtom } from "../../../store/app";

const SearchInput: React.FC = () => {
  const [searchValue, setSearchValue] = useAtom(searchValueAtom);

  const { handleSearch } = useAppActionContext();

  const { setActiveLayout } = useLayoutContext();

  const { isFocused } = useFocus({ autoFocus: true });

  const handleSubmit = useCallback(async () => {
    if (searchValue.length < SEARCH_MIN_CHAR) {
      return;
    }

    await handleSearch();
    setActiveLayout(LAYOUT_KEY.RESULT_LIST_LAYOUT);
  }, [searchValue, handleSearch, setActiveLayout]);

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

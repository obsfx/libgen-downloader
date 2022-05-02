import React, { useCallback, useContext, useEffect } from 'react';
import { useFocus } from 'ink';

import Input from '../../../components/Input';
import { IAppContext, AppContext } from '../../../AppContext';
import { SEARCH_MIN_CHAR } from '../../../../constants/options';

const SearchInput: React.FC<{}> = ({}) => {
  const { searchValue, setSearchValue, showSearchMinCharWarning, setShowSearchMinCharWarning } =
    useContext(AppContext) as IAppContext;

  const { isFocused } = useFocus({ autoFocus: true });

  const handleSubmit = useCallback(() => {
    if (searchValue.length < SEARCH_MIN_CHAR) {
      setShowSearchMinCharWarning(true);
    }
  }, [searchValue]);

  useEffect(() => {
    if (showSearchMinCharWarning && searchValue.length >= SEARCH_MIN_CHAR) {
      setShowSearchMinCharWarning(false);
    }
  }, [searchValue]);
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

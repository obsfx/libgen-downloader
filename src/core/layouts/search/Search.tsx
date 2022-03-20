import React, { useCallback, useContext, useEffect } from 'react';
import { Box, useFocus } from 'ink';

import SearchInfo from './SearchInfo';
import SearchWarning from './SearchWarning';
import SearchInput from '../../components/SearchInput';
import { IAppContext, AppContext } from '../../AppContext';
import { SEARCH_MIN_CHAR } from '../../../constants/options';

const Search: React.FC = () => {
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
    <Box flexDirection="column">
      <SearchInfo />
      <SearchWarning />
      <SearchInput
        isFocused={isFocused}
        searchValue={searchValue}
        onSearchValueChange={setSearchValue}
        onSubmit={handleSubmit}
      />
    </Box>
  );
};

export default Search;

import React, { useContext } from 'react';
import { Box, Text, useFocus } from 'ink';
import InkTextInput from 'ink-text-input';

import { IAppContext, AppContext } from '../AppContext';

const SearchInput: React.FC<{
  isFocused?: boolean;
}> = ({}) => {
  const { searchValue, setSearchValue } = useContext(AppContext) as IAppContext;

  const { isFocused } = useFocus({ autoFocus: true });

  return (
    <Box>
      <Box marginRight={1}>
        <Text wrap="truncate">
          <Text>? </Text>
          <Text color="yellowBright" inverse={isFocused}>
            Search:
          </Text>
        </Text>
      </Box>

      <Text wrap="truncate">
        <InkTextInput value={searchValue} onChange={setSearchValue} showCursor={isFocused} />
      </Text>
    </Box>
  );
};

export default SearchInput;

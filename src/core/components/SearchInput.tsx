import React from 'react';
import { Box, Text } from 'ink';
import InkTextInput from 'ink-text-input';

import { SEARCH_MIN_CHAR } from '../../constants/options';

const SearchInput: React.FC<{
  isFocused: boolean;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  onSubmit: () => void;
}> = ({ isFocused, searchValue, onSearchValueChange, onSubmit }) => {
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
        <InkTextInput
          value={searchValue}
          onChange={onSearchValueChange}
          showCursor={isFocused}
          placeholder={`Search string must contain minimum ${SEARCH_MIN_CHAR} characters.`}
          onSubmit={onSubmit}
        />
      </Text>
    </Box>
  );
};

export default SearchInput;

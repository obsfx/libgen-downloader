import React from 'react';
import { Box, Text } from 'ink';
import InkTextInput from 'ink-text-input';

const Input: React.FC<{
  label: string;
  placeholder: string;
  isFocused: boolean;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  onSubmit: () => void;
}> = ({ label, placeholder, isFocused, searchValue, onSearchValueChange, onSubmit }) => {
  return (
    <Box>
      <Box marginRight={1}>
        <Text>? </Text>
        <Text color="yellowBright" inverse={isFocused}>
          {label}:
        </Text>
      </Box>

      <Text wrap="truncate">
        <InkTextInput
          value={searchValue}
          onChange={onSearchValueChange}
          showCursor={isFocused}
          placeholder={placeholder}
          onSubmit={onSubmit}
        />
      </Text>
    </Box>
  );
};

export default Input;

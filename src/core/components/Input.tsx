import React, { useCallback } from 'react';
import { Box, Text } from 'ink';
import InkTextInput from 'ink-text-input';

const Input: React.FC<{
  label: string;
  placeholder: string;
  isFocused: boolean;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  onSubmit?: () => void;
}> = ({ label, placeholder, isFocused, searchValue, onSearchValueChange, onSubmit }) => {
  const handleOnChange = useCallback(
    (val: string) => {
      if (isFocused) {
        onSearchValueChange(val);
      }
    },
    [isFocused, onSearchValueChange]
  );

  const handleOnSubmit = useCallback(() => {
    if (isFocused && onSubmit) {
      onSubmit();
    }
  }, [isFocused, onSubmit]);

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
          onChange={handleOnChange}
          showCursor={isFocused}
          placeholder={placeholder}
          onSubmit={handleOnSubmit}
        />
      </Text>
    </Box>
  );
};

export default Input;

import React from "react";
import { Box, Text } from "ink";
import InkTextInput from "ink-text-input";

const Input: React.FC<{
  label: string;
  placeholder: string;
  isFocused: boolean;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  onSubmit?: () => void;
}> = ({ label, placeholder, isFocused, searchValue, onSearchValueChange, onSubmit }) => {
  const handleOnChange = (val: string) => {
    console.log("Input", { val, isFocused });
    if (isFocused) {
      onSearchValueChange(val);
    }
  };

  const handleOnSubmit = () => {
    if (isFocused && onSubmit) {
      onSubmit();
    }
  };

  return (
    <Box>
      <Box marginRight={1}>
        <Text>?</Text>
        <Box marginLeft={1}>
          <Text color="yellowBright" inverse={isFocused} wrap="truncate">
            {label}:
          </Text>
        </Box>
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

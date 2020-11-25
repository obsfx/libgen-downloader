import React from 'react';
import { Box, Text, useFocus } from 'ink';
import TextInput from 'ink-text-input';

type Props = {
  labelText: string,
  placeholder?: string,
  value: string,
  minChar?: number,
  onChange: (value: string) => void,
  onSubmit?: (value: string) => void
}

const Input = (props: Props) => {
  const {
    labelText,
    placeholder,
    value,
    minChar,
    onChange,
    onSubmit
  } = props;

  const { isFocused } = useFocus({ autoFocus: true });

  return (
    <Box width='100%' paddingRight={4} flexDirection='column'>
      {
        minChar && value.length < minChar && 
        <Text color='yellow' wrap='truncate'>
          Search string must contain minimum {minChar} characters.
        </Text>
      }
      <Text wrap='truncate'>
        <Text>? </Text>
        <Text color='yellowBright' inverse={isFocused}>{labelText}:</Text>
        &nbsp;
        <TextInput 
          value={value} 
          showCursor={isFocused}
          placeholder={placeholder}
          onChange={(val: string) => {
            if (!isFocused) return;
            onChange(val);
          }} 
          onSubmit={() => {
            if (!isFocused || (minChar && value.length < minChar)) return;
            onSubmit && onSubmit(value);
        }}/>
      </Text>
    </Box>
  )
}

export default Input;

import React from 'react';
import { Box, Text, useFocus } from 'ink';
import { useStore } from '../store-provider';
import TextInput from 'ink-text-input';

type inputProps = {
  labelText: string,
  placeholder: string,
  value: string,
  minChar: number | false,
  onChange: (value: string) => void,
  onSubmit: (value: string) => void
}
const Input = (props: inputProps) => {
  const {
    labelText,
    placeholder,
    value,
    minChar,
    onChange,
    onSubmit
  } = props;

  const { isFocused } = useFocus({ autoFocus: true });
  const appWidth: number = useStore(state => state.globals.appWidth);

  return (
    <Box width={appWidth} paddingRight={4}>
      <Text wrap='truncate'>
        <Text>? </Text>
        <Text color='yellowBright' inverse={isFocused}>{labelText}:</Text>
        <Text> </Text>
        {
          !isFocused ?
          <Text>{value}</Text> :
          <TextInput 
            value={value} 
            placeholder={placeholder}
            onChange={onChange} 
            onSubmit={onSubmit}/>
        }
      </Text>
    </Box>
  )
}

export default Input;

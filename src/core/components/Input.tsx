import React, { useState } from 'react';
import { Box, Text, useFocus } from 'ink';
import useStore from '../../store-provider';
import TextInput from 'ink-text-input';

type inputProps = {
  labelText: string,
  placeholder: string,
  value: string | undefined,
  minChar: number | false,
  onSubmit: (query: string) => void
}
const Input = (props: inputProps) => {
  const {
    labelText,
    placeholder,
    value,
    minChar,
    onSubmit
  } = props;

  const appWidth: number = useStore(state => state.appWidth);
  const [ inputVal, setInputVal ] = useState(value || '');
  const { isFocused } = useFocus({ autoFocus: true });

  return (
    <Box width={appWidth} paddingRight={4}>
      <Text wrap='truncate'>
        <Text>? </Text>
        <Text color='yellowBright' inverse={isFocused}>{labelText}:</Text>
        <Text> </Text>
        {
          !isFocused ?
          <Text>{inputVal}</Text> :
          <TextInput 
            value={inputVal} 
            placeholder={placeholder}
            onChange={setInputVal} 
            onSubmit={() => onSubmit(inputVal)}/>
        }
      </Text>
    </Box>
  )
}

export default Input;

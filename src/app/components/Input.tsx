import React from 'react';
import { Box, Text, useFocus } from 'ink';
import TextInput from 'ink-text-input';

type Props = {
  labelText: string,
  placeholder: string,
  value: string,
  minChar: number | false,
  onChange: (value: string) => void,
  onSubmit: (value: string) => void
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
    <Box width='100%' paddingRight={4}>
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

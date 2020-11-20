import React, { useEffect } from 'react';
import { Box, Text, useFocus, useFocusManager, useInput, Key } from 'ink';

type Props = {
  disabled?: boolean;
  text: string;
  data: string;
  onSelect: (data: string) => void;
}

const TabButton = (props: Props) => {
  const {
    disabled,
    text,
    data,
    onSelect
  } = props;

  const { isFocused } = useFocus();
  const { focusNext } = useFocusManager();

  useEffect(() => {
    if (isFocused && disabled) {
      focusNext();
    }
  }, [isFocused]);

  useInput((_, key: Key) => {
    if (isFocused && key.return) {
      onSelect(data);
    }
  });

  return (
    <Box marginX={1}>
      <Text 
        wrap='truncate' 
        inverse={isFocused || disabled}
        color={disabled ? 'grey' : isFocused ? 'yellow' : 'bgGray'}>
        &nbsp;{text}&nbsp;
      </Text>
    </Box>
  )
}

export default TabButton;

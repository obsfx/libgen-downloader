import React, { useState, ReactNode } from 'react';
import { Box, Text, useInput, Key, useFocus } from 'ink';

type Props = {
  children?: ReactNode;
  showText: string;
  hideText: string;
}

const Expand = (props: Props) => {
  const {
    showText,
    hideText,
    children
  } = props;

  const [ expanded, setExpanded ] = useState(false);
  const { isFocused } = useFocus();

  useInput((_, key: Key) => {
    if (key.return && isFocused) {
      setExpanded(!expanded);
    }
  });

  return (
    <Box flexDirection='column' width='100%'>
      <Text wrap='truncate'>
        {
          !expanded ?
          <Text>
            <Text bold={true}>+ </Text>
            <Text color='yellowBright' inverse={isFocused}>{showText}</Text>
          </Text> :
          <Text>
            <Text bold={true}>- </Text>
            <Text color='yellowBright' inverse={isFocused}>{hideText}</Text>
          </Text>
        }
        {
          isFocused && <Text> Press [ENTER] to toogle the dropwdown</Text>
        }
      </Text> 
      <Box paddingLeft={2} flexDirection='column' width='100%'>
        { expanded && children }
      </Box>
    </Box>
  )
}

export default Expand;

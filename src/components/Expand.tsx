import React, { useState, ReactNode } from 'react';
import { Box, Text, useInput, Key, useFocus } from 'ink';

type expandProps = {
  children?: ReactNode;
  showText: string;
  hideText: string;
}

const Expand = (props: expandProps) => {
  let {
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
    <Box flexDirection='column'>
      <Text wrap='truncate'>
        {
          !expanded ?
          <Text>
            <Text>+ </Text>
            <Text color='yellowBright' inverse={isFocused}>{showText}</Text>
          </Text> :
          <Text>
            <Text>- </Text>
            <Text color='yellowBright' inverse={isFocused}>{hideText}</Text>
          </Text>
        }
        {
          isFocused && <Text> Press [ENTER] to toogle the dropwdown</Text>
        }
      </Text> 
      <Box paddingLeft={2} flexDirection='column'>
        { expanded && children }
      </Box>
    </Box>
  )
}

export default Expand;

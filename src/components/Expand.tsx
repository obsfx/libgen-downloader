import React, { useState, ReactNode } from 'react';
import { Box, Text, useInput, Key, useFocus } from 'ink';

type expandProps = {
  showText: string,
  hideText: string,
  children?: ReactNode
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
      <Text>
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
          isFocused && <Text color='gray'> Press [ENTER] to toogle the dropwdown</Text>
        }
      </Text> 
      <Box paddingLeft={2} flexDirection='column'>
        { expanded && children }
      </Box>
    </Box>
  )
}

export default Expand;

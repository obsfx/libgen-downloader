import React, { useState, ReactNode } from 'react';
import { Box, Text, useInput, Key, useFocus } from 'ink';

type expandProps = {
  children?: ReactNode
}

const Expand = (props: expandProps) => {
  const [ expanded, setExpanded ] = useState(false);
  const { isFocused } = useFocus();

  useInput((_, key: Key) => {
    if (key.return && isFocused) {
      setExpanded(!expanded);
    }
  });

  return (
    <Box flexDirection='column'>
      {
        !expanded ?
        <Text color='greenBright' inverse={isFocused}>+ Show Filters</Text> :
        <Text color='greenBright' inverse={isFocused}>- Hide Filters</Text>
      }
      <Box paddingLeft={2} flexDirection='column'>
        { expanded && props.children }
      </Box>
    </Box>
  )
}

export default Expand;

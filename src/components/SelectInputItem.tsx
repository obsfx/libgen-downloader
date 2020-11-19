import React, { ReactNode } from 'react';
import { Box, Text } from 'ink';

type Props = {
  children?: ReactNode;
  hovered: boolean;
}

const SelectInputItem = (props: Props) => {
  let {
    children,
    hovered,
  } = props;

  return (
    <Box flexDirection='column'>
      <Text wrap='truncate'>
        { hovered && <Text bold={true}>&gt;&nbsp;</Text> } 
        <Text bold={hovered} color={hovered ? 'cyanBright' : ''}>{ children }</Text> 
      </Text>
    </Box>
  )
}

export default SelectInputItem;

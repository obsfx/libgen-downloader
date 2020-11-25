import React, { ReactNode } from 'react';
import { Box, Text } from 'ink';
import figures from 'figures';

type Props = {
  children?: ReactNode;
  hovered: boolean;
}

const SelectInputItem = (props: Props) => {
  const {
    children,
    hovered,
  } = props;

  return (
    <Box flexDirection='column' width='100%'>
      <Text wrap='truncate'>
        { hovered && <Text bold={true}>{figures.pointer}&nbsp;</Text> } 
        <Text bold={hovered} color={
          hovered ? 'yellowBright' : '' 
        }>{ children }</Text> 
      </Text>
    </Box>
  )
}

export default SelectInputItem;

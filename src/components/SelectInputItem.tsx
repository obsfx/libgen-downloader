import React, { ReactNode } from 'react';
import { Box, Text } from 'ink';
import figures from 'figures';

type Props = {
  children?: ReactNode;
  fadedOut: boolean;
  hovered: boolean;
}

const SelectInputItem = (props: Props) => {
  const {
    children,
    fadedOut,
    hovered,
  } = props;

  return (
    <Box flexDirection='column' width='100%'>
      <Text wrap='truncate'>
        { !fadedOut && hovered && <Text bold={true}>{figures.pointer}&nbsp;</Text> } 
        <Text bold={hovered} color={
          fadedOut ? 'grey' :
          (hovered ? 'yellowBright' : '') 
        }>{ children }</Text> 
      </Text>
    </Box>
  )
}

export default SelectInputItem;

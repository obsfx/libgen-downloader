import React, { ReactNode } from 'react';
import { Box, Text, useInput, Key } from 'ink';
import { returnedValue } from '../../store-provider';
import figures from 'figures';

type Props = {
  children?: ReactNode;
  value: returnedValue;
  hovered: boolean;
  fadedOut: boolean;
  onSelect: (returned: returnedValue) => void;
}

const ListItem = (props: Props) => {
  const {
    children,
    value,
    hovered,
    fadedOut,
    onSelect
  } = props;

  useInput((_, key: Key) => {
    if (hovered && key.return) {
      onSelect(value);
    }
  });

  return (
    <Box flexDirection='column' width='100%'>
      <Text wrap='truncate'>
        { !fadedOut && hovered && <Text bold={true}>{figures.pointer}&nbsp;</Text> } 
        &nbsp;&nbsp;
        <Text bold={hovered} color={
          !fadedOut && hovered ? 
            'cyanBright' : (fadedOut ? 'grey' : 'yellow') 
        }>{children}</Text> 
      </Text>
    </Box>
  )
}

export default ListItem;

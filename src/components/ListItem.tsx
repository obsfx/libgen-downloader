import React, { ReactNode } from 'react';
import { Box, Text } from 'ink';
import SelectInput, { option } from './SelectInput';

type Props<T> = {
  children?: ReactNode;
  options: option<T>[];
  hovered: boolean;
  expanded: boolean;
  fadedOut: boolean;
  checked: boolean;
  onSelect: (returned: T) => void;
}

const ListItem = <T extends {}>(props: Props<T>) => {
  let {
    children,
    options,
    hovered,
    expanded,
    fadedOut,
    checked,
    onSelect
  } = props;

  return (
    <Box flexDirection='column'>
      <Text wrap='truncate'>
        { !fadedOut && hovered && <Text bold={true}>&gt;&nbsp;</Text> } 
        <Text color='greenBright'>{!fadedOut && checked ? 'X' : ' '}</Text>&nbsp;
        <Text bold={hovered} color={!fadedOut && hovered ? 'yellow' : fadedOut ? 'grey' : ''}>{children}</Text> 
      </Text>
      { expanded && 
        <Box paddingLeft={4}>
          <SelectInput<T> options={options} onSelect={onSelect} />
        </Box>
      }
    </Box>
  )
}

export default ListItem;

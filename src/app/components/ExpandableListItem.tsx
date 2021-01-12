import React, { ReactNode } from 'react';
import { Box, Text } from 'ink';
import { returnedValue } from '../../store-provider';
import SelectInput, { SelectInputItem } from './SelectInput';
import figures from 'figures';
import InkSpinner from 'ink-spinner';

type Props = {
  children?: ReactNode;
  selectInputItems: SelectInputItem[];
  hovered: boolean;
  expanded: boolean;
  fadedOut: boolean;
  checked: boolean;
  downloading: boolean;
  onSelect: (returned: returnedValue) => void;
}

const ListItem = (props: Props) => {
  const {
    children,
    selectInputItems,
    hovered,
    expanded,
    fadedOut,
    checked,
    downloading,
    onSelect
  } = props;

  return (
    <Box flexDirection='column' width='100%' paddingLeft={expanded ? 2 : 0}>
      <Text wrap='truncate'>
        { !expanded && !fadedOut && hovered && <Text bold={true}>{figures.pointer}&nbsp;</Text> } 
        { downloading && 
          <Text color='greenBright'><InkSpinner type='dots' /> </Text>
        } 
        <Text color='greenBright'>{checked ? figures.tick : ' '}</Text>&nbsp;
        <Text bold={hovered || checked} color={
          !fadedOut && hovered ? 
            'cyanBright' : (checked ? 'greenBright' : (fadedOut ? 'grey' : '')) 
        }>{children}</Text> 
      </Text>
      { expanded && 
        <Box paddingLeft={2} width='100%'>
          <SelectInput selectInputItems={selectInputItems} hideInfo={true} onSelect={onSelect} />
        </Box>
      }
    </Box>
  )
}

export default ListItem;

import React, { ReactNode } from 'react';
import { Box, Text } from 'ink';
import SelectInput, { option } from './SelectInput';

type listItemProps = {
  children?: ReactNode;
  hovered: boolean;
  expanded: boolean;
  fadedOut: boolean;
  checked: boolean;
  onSelect: (returned: string) => void;
}

const ListItem = (props: listItemProps) => {
  let {
    children,
    hovered,
    expanded,
    fadedOut,
    checked,
    onSelect
  } = props;

  const expandOptions: option[] = [
    {
      label: 'See Details',
      value: 'seeDetails'
    },
    {
      label: 'Dowload Directly',
      value: 'downloadDirectly'
    },
    {
      label: 'Add To Bulk Downloading Queue',
      value: 'addToBulkDownloadingQueue'
    },
    {
      label: 'Turn Back To The List',
      value: 'turnBackToTheList'
    }
  ];

  return (
    <Box flexDirection='column'>
      <Text wrap='truncate'>
        { !fadedOut && hovered && <Text bold={true}>&gt;&nbsp;</Text> } 
        <Text color='greenBright'>{!fadedOut && checked ? 'X' : ' '}</Text>&nbsp;
        <Text bold={hovered} color={!fadedOut && hovered ? 'yellow' : fadedOut ? 'grey' : ''}>{ children }</Text> 
      </Text>
      { expanded && 
        <Box paddingLeft={4}>
          <SelectInput options={expandOptions} onSelect={onSelect}/>
        </Box>
      }
    </Box>
  )
}

export default ListItem;

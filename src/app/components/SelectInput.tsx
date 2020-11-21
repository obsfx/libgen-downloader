import React, { useState } from 'react';
import { Box, useInput, Key } from 'ink';
import { returnedValue } from '../../store-provider';
import SelectInputItem from './SelectInputItem';

export type SelectInputItem = {
  label: string;
  value: returnedValue;
  disabled?: boolean;
}

type Props = {
  selectInputItems: SelectInputItem[];
  focused: boolean;
  onSelect: (returned: returnedValue) => void;
}

const SelectInput = (props: Props) => {
  const {
    selectInputItems,
    focused,
    onSelect
  } = props;

  const [ cursorPos, setCursorPos ] = useState(0);

  useInput((_, key: Key) => {
    if (focused) {
      if (key.upArrow) {
        setCursorPos(cursorPos - 1 < 0 ? selectInputItems.length - 1 : cursorPos - 1);
      }

      if (key.downArrow) {
        setCursorPos((cursorPos + 1) % selectInputItems.length);
      }

      if (key.return) {
        onSelect(selectInputItems[cursorPos].value);
      }
    }
  });

  return (
    <Box flexDirection='column' width='100%'>
    {
      selectInputItems.map((option: SelectInputItem, i: number) => (
        <SelectInputItem
          key={i}
          fadedOut={!focused}
          hovered={cursorPos == i}>
          {option.label}
        </SelectInputItem>
      ))
    }
    </Box>
  )
}

export default SelectInput;

import React, { useState } from 'react';
import { Box, useInput, Key } from 'ink';
import SelectInputItem from './SelectInputItem';

export type SelectInputItem<T> = {
  label: string;
  value: T;
}

type Props<T> = {
  selectInputItems: SelectInputItem<T>[];
  focused: boolean;
  onSelect: (returned: T) => void;
}

const SelectInput = <T extends unknown>(props: Props<T>) => {
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
      selectInputItems.map((option: SelectInputItem<T>, i: number) => (
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

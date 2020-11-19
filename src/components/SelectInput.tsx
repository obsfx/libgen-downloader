import React, { useState } from 'react';
import { Box, useInput, Key } from 'ink';
import SelectInputItem from './SelectInputItem';

export type option<T> = {
  label: string;
  value: T;
}

type Props<T> = {
  options: option<T>[];
  onSelect: (returned: T) => void;
}

const SelectInput = <T extends {}>(props: Props<T>) => {
  let {
    options,
    onSelect
  } = props;

  const [ cursorPos, setCursorPos ] = useState(0);

  useInput((_, key: Key) => {
    if (key.upArrow) {
      setCursorPos(cursorPos - 1 < 0 ? options.length - 1 : cursorPos - 1);
    }

    if (key.downArrow) {
      setCursorPos((cursorPos + 1) % options.length);
    }

    if (key.return) {
      onSelect(options[cursorPos].value);
    }
  });

  return (
    <Box flexDirection='column'>
    {
      options.map((option: option<T>, i: number) => (
        <SelectInputItem
          key={i}
          hovered={cursorPos == i}>
          {option.label}
        </SelectInputItem>
      ))
    }
    </Box>
  )
}

export default SelectInput;

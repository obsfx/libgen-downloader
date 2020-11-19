import React, { useState } from 'react';
import { Box, useInput, Key } from 'ink';
import SelectInputItem from './SelectInputItem';

export type option = {
  label: string;
  value: string;
}

type selectInputProps = {
  options: option[];
  onSelect: (returned: string) => void;
}

const SelectInput = (props: selectInputProps) => {
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
      options.map((option: option, i: number) => (
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

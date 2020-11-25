import React, { ReactNode, useState, useEffect } from 'react';
import { Box, useInput, Key, Text } from 'ink';
import { returnedValue } from '../../store-provider';
import SelectInputItem from './SelectInputItem';

export type SelectInputItem = {
  label: ReactNode;
  value: returnedValue;
  disabled?: boolean;
}

type Props = {
  selectInputItems: SelectInputItem[];
  onSelect: (returned: returnedValue) => void;
  hideInfo?: boolean;
}

const SelectInput = (props: Props) => {
  const {
    selectInputItems,
    onSelect,
    hideInfo
  } = props;

  const [ cursorPos, setCursorPos ] = useState(0);
  const [ input, setInput ] = useState(false);

  const items: SelectInputItem[] = selectInputItems
  .filter((option: SelectInputItem) => !option.disabled);

  useEffect(() => {
    setInput(true);
    () => setInput(false);
  }, []);

  useInput((_, key: Key) => {
    if (key.upArrow) {
      setCursorPos(cursorPos - 1 < 0 ? items.length - 1 : cursorPos - 1);
    }

    if (key.downArrow) {
      setCursorPos((cursorPos + 1) % items.length);
    }

    if (key.return) {
      onSelect(items[cursorPos].value);
    }
  }, { isActive: input });

  return (
    <Box flexDirection='column' width='100%'>
      <Box flexDirection='column' paddingLeft={2} width='100%'>
        {
          items.map((option: SelectInputItem, i: number) => (
            <SelectInputItem
              key={i}
              hovered={cursorPos == i}>
              {option.label}
            </SelectInputItem>
          ))
        }
      </Box>
      {
        !hideInfo && 
        <Box>
          <Text wrap='truncate'>
            [UP] and [DOWN] arrow keys to reveal listings, [ENTER] key to interact
          </Text>
        </Box>
      }
    </Box>
  )
}

export default SelectInput;

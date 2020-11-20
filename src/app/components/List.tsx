import React, { useState, useEffect } from 'react';
import { Box, useInput, Key, useFocus } from 'ink';
import { Entry } from '../../search-api';
import { ui_page_size } from '../app-config.json';
import ListItem from './ListItem';
import { SelectInputItem } from './SelectInput';

type Props<T>= {
  entries: Entry[];
  currentPage: number;
  pageSize: number;
  bulkQueue: string[];
  generateSelectInputItems: (checked: boolean) => SelectInputItem<T>[];
  handleOnSelect: (expanded: boolean, setExpanded: Function, entryData: Entry, returnedValue: T) => void;
}

type Item = {
  entryData: Entry;
  text: string;
}

const List = <T extends unknown>(props: Props<T>) => {
  const {
    entries,
    currentPage,
    pageSize,
    bulkQueue,
    generateSelectInputItems,
    handleOnSelect
  } = props;

  const [ items, setItems ] = useState<Item[]>([]);
  const [ expanded, setExpanded ] = useState<boolean>(false);

  const { isFocused } = useFocus({ autoFocus: true });

  useEffect(() => {
    const items: Item[] = entries.map((entry: Entry, i: number) => {
      const idx: number = i + 1 + (currentPage - 1) * pageSize;
      const extension: string = entry.extension;
      const title: string = entry.title;

      let text: string = `[${idx}] [${extension}] ${title}`;

      return { entryData: entry, text };
    });

    const renderListLength: number = ui_page_size > items.length ? items.length : ui_page_size;

    setItems([ 
      ...items.slice(items.length - Math.floor(renderListLength / 2), items.length), 
      ...items.slice(0, items.length - Math.floor(renderListLength / 2))
    ]);
  }, [entries]);

  useInput((_, key: Key) => {
    if (isFocused && !expanded) {
      if (key.upArrow) {
        const lastEntry: Item | undefined = items.pop();

        if (lastEntry) {
          items.unshift(lastEntry);
          setItems([...items]);
        }
      }

      if (key.downArrow) {
        const firstEntry: Item | undefined = items.shift();

        if (firstEntry) {
          items.push(firstEntry);
          setItems([...items]);
        }
      }

      if (key.return) {
        setExpanded(!expanded);
      }
    }
  });

  const renderList: Item[] = items.slice(0, ui_page_size);

  return (
    <Box 
      flexDirection='column'
      borderStyle='round' 
      borderColor='grey'
      width='100%'
      paddingLeft={1} 
      paddingRight={1}>
      <Box width='100%' flexDirection='column'>
        {
          renderList.map((item: Item, i: number) => {
            const itemHovered: boolean = i == Math.floor(renderList.length / 2);
            const itemExpanded: boolean = expanded && itemHovered;
            const itemFadedOut: boolean = !isFocused || (expanded && !itemHovered);
            const itemChecked: boolean = bulkQueue.includes(item.entryData.id);

            const selectInputItems: SelectInputItem<T>[] = generateSelectInputItems(itemChecked);

            return (!expanded || i + selectInputItems.length < ui_page_size) && <ListItem<T>
              key={item.entryData.id} 
              selectInputItems={selectInputItems}
              hovered={itemHovered}
              focused={isFocused}
              expanded={itemExpanded}
              fadedOut={itemFadedOut}
              checked={itemChecked}
              onSelect={(returned: T) => handleOnSelect(expanded, setExpanded, item.entryData, returned)}>
              {item.text}
            </ListItem>
          })
        }
      </Box>
    </Box>
  );
}

export default List;

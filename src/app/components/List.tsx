import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, Key, useFocus } from 'ink';
import { Entry } from '../../search-api';
import { useStore, Item, returnedValue } from '../../store-provider';
import { ui_page_size } from '../app-config.json';
import { SelectInputItem } from './SelectInput';
import ListItem from './ListItem';
import ExpandableListItem from './ExpandableListItem';

type Props = {
  entries: Entry[];
  options: SelectInputItem[];
  currentPage: number;
  pageSize: number;
  bulkQueue: string[];
  generateSelectInputItems: (checked: boolean) => SelectInputItem[];
  handleOnSelect: (expanded: boolean, setExpanded: Function, entryData: Entry | null, returnedValue: returnedValue) => void;
}

const List = (props: Props) => {
  const {
    entries,
    options,
    currentPage,
    pageSize,
    bulkQueue,
    generateSelectInputItems,
    handleOnSelect
  } = props;

  const [ expanded, setExpanded ] = useState<boolean>(false);

  const listBuffer: Item[] = useStore(state => state.globals.listBuffer);
  const setListBuffer: (listBuffer: Item[]) => void = useStore(state => state.set.listBuffer);

  const { isFocused } = useFocus({ autoFocus: true });

  useEffect(() => {
    if (listBuffer.length == 0) {
      const entryItems: Item[] = entries.map((entry: Entry, i: number) => {
        const idx: number = i + 1 + (currentPage - 1) * pageSize;
        const extension: string = entry.extension;
        const title: string = entry.title;

        let text: string = `[${idx}] [${extension}] ${title}`;

        return { 
          key: entry.id, 
          data: entry, 
          text, 
          expandable: true,
          value: null
        };
      });

      const optionItems: Item[] = [];

      for (let i = 0; i < options.length; i++) {
        const option: SelectInputItem = options[i];

        if (option.disabled) continue;

        optionItems.push({
          key: `option${i}`,
          text: option.label,
          value: option.value,
          expandable: false,
          data: null
        });
      }

      const pool: Item[] = [ ...optionItems, ...entryItems ];

      const renderListLength: number = pool.length > ui_page_size ? ui_page_size : pool.length;

      setListBuffer([ 
        ...pool.slice(pool.length - Math.floor(renderListLength / 2), pool.length), 
        ...pool.slice(0, pool.length - Math.floor(renderListLength / 2))
      ]);
    }
  }, [entries]);

  const renderList: Item[] = listBuffer.slice(0, ui_page_size);

  useInput((_, key: Key) => {
    if (isFocused && !expanded) {
      if (key.upArrow) {
        const lastEntry: Item | undefined = listBuffer.pop();

        if (lastEntry) {
          listBuffer.unshift(lastEntry);
          setListBuffer([...listBuffer]);
        }
      }

      if (key.downArrow) {
        const firstEntry: Item | undefined = listBuffer.shift();

        if (firstEntry) {
          listBuffer.push(firstEntry);
          setListBuffer([...listBuffer]);
        }
      }

      if (renderList[Math.floor(renderList.length / 2)].expandable && key.return) {
        setExpanded(!expanded);
      }
    }
  });

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
            const itemChecked: boolean = bulkQueue.includes(item.data?.id || '');
            const selectInputItems: SelectInputItem[] = generateSelectInputItems(itemChecked);

            if (!expanded || i + selectInputItems.length < ui_page_size) {
              if (item.expandable && item.data) {
                return <ExpandableListItem
                  key={item.key} 
                  selectInputItems={selectInputItems}
                  hovered={itemHovered}
                  focused={isFocused}
                  expanded={itemExpanded}
                  fadedOut={itemFadedOut}
                  checked={itemChecked}
                  onSelect={(returned: returnedValue) => handleOnSelect(expanded, setExpanded, item.data, returned)}>
                  {item.text}
                </ExpandableListItem>
              }

              if (!item.expandable && item.value) {
                return <ListItem
                  key={item.key} 
                  value={item.value}
                  hovered={itemHovered}
                  fadedOut={itemFadedOut}
                  onSelect={(returned: returnedValue) => handleOnSelect(expanded, setExpanded, null, returned)}>
                  {item.text}
                </ListItem>
              }
            }

            return null;
          })
        }
      </Box>
    </Box>
  );
}

export default List;

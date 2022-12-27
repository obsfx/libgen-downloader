import React, { useState, useEffect } from 'react';
import { Box, useInput, Key } from 'ink';
import { Entry } from '../../search-api';
import { useStore, Item, returnedValue } from '../../store-provider';
import { ui_page_size } from '../app-config.json';
import { SelectInputItem } from './SelectInput';
import ListItem from './ListItem';
import ExpandableListItem from './ExpandableListItem';

export type ListEntry = {
  idx: number,
  data: Entry
}

type Props = {
  entries: ListEntry[];
  options: SelectInputItem[];
  pageSize: number;
  generateSelectInputItems: (inBulkQueue: boolean, inDownloadQueue: boolean) => SelectInputItem[];
  handleOnSelect: (expanded: boolean, setExpanded: Function, entryData: Entry | null, returnedValue: returnedValue) => void;
}

const List = (props: Props) => {
  const {
    entries,
    options,
    pageSize,
    generateSelectInputItems,
    handleOnSelect
  } = props;

  const [ expanded, setExpanded ] = useState<boolean>(false);
  const [ input, setInput ] = useState(false);

  const currentPage: number = useStore(state => state.globals.currentPage);
  const bulkQueue: string[] = useStore(state => state.globals.bulkQueue);
  const downloadQueue: Entry[] = useStore(state => state.globals.downloadQueue);

  const listBuffer: Item[] = useStore(state => state.globals.listBuffer);
  const setListBuffer: (listBuffer: Item[]) => void = useStore(state => state.set.listBuffer);

  useEffect(() => {
    setInput(true);
    () => setInput(false);
  }, []);

  useEffect(() => {
    if (listBuffer.length == 0) {
      const entryItems: Item[] = entries.map((entry: ListEntry) => {
        const idx: number = entry.idx + 1 + (currentPage - 1) * pageSize;
        const extension: string = entry.data.extension;
        const title: string = entry.data.title;

        let text: string = `[${idx}] [${extension}] ${title}`;

        return { 
          key: entry.data.id, 
          data: entry.data, 
          text, 
          expandable: true,
          value: null
        };
      });

      const optionItems: Item[] = options
      .filter((option: SelectInputItem) => !option.disabled)
      .map((option: SelectInputItem, i: number) => ({
        key: `option${i}`,
        text: option.label,
        value: option.value,
        expandable: false,
        data: null
      }));

      const pool: Item[] = [ ...optionItems, ...entryItems ];

      const renderListLength: number = pool.length > ui_page_size ? ui_page_size : pool.length;

      setListBuffer([ 
        ...pool.slice(pool.length - Math.floor(renderListLength / 3), pool.length), 
        ...pool.slice(0, pool.length - Math.floor(renderListLength / 3))
      ]);
    }
  }, [entries]);

  const renderList: Item[] = listBuffer.slice(0, ui_page_size);

  useInput((_, key: Key) => {
    if (!expanded) {
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

      const selectedItem: Item | undefined = renderList[Math.floor(renderList.length / 3)];

      if (key.tab) {
        if (selectedItem?.data?.id) {
          const itemChecked: boolean = bulkQueue.indexOf(selectedItem.data.id) > -1;
          handleOnSelect(
            expanded,
            setExpanded,
            selectedItem.data,
            itemChecked
              ? returnedValue.removeFromBulkDownloadingQueue
              : returnedValue.addToBulkDownloadingQueue
          );
        }
      }

      if (selectedItem.expandable && key.return) {
        setExpanded(!expanded);
      }
    }
  }, { isActive: input });

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
            const itemHovered: boolean = i == Math.floor(renderList.length / 3);
            const itemExpanded: boolean = expanded && itemHovered;
            const itemFadedOut: boolean = expanded && !itemHovered;
            const itemChecked: boolean = item.data?.id ? bulkQueue.indexOf(item.data?.id) > -1 : false;
            const itemInDownloadQueue: boolean = item.data ? downloadQueue.indexOf(item.data) > -1 : false;
            const selectInputItems: SelectInputItem[] = generateSelectInputItems(itemChecked, itemInDownloadQueue);

            if (!expanded || i + selectInputItems.length < ui_page_size) {
              if (item.expandable && item.data) {
                return <ExpandableListItem
                  key={item.key} 
                  selectInputItems={selectInputItems}
                  hovered={itemHovered}
                  expanded={itemExpanded}
                  fadedOut={itemFadedOut}
                  checked={itemChecked}
                  downloading={itemInDownloadQueue}
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

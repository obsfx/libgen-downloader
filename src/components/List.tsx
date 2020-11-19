import React, { useState, useEffect } from 'react';
import { Box, useInput, Key } from 'ink';
import { useStore } from '../store-provider';
import { Entry } from '../search-api';
import { ui_page_size } from '../app-config.json';
import ListItem from './ListItem';
import { option } from './SelectInput';

const List = () => {
  type item = {
    entryData: Entry;
    text: string;
  }

  type returnedValue = 'seeDetails' |
    'downloadDirectly' |
    'addToBulkDownloadingQueue' |
    'removeFromBulkDownloadingQueue' |
    'turnBackToTheList';

  const [ items, setItems ] = useState<item[]>([]);
  const [ expanded, setExpanded ] = useState<boolean>(false);

  const currentPage: number = useStore(state => state.globals.currentPage);
  const pageSize: number = useStore(state => state.config?.pageSize) || 25;
  const entries: Entry[] = useStore(state => state.globals.entries);

  useEffect(() => {
    const items: item[] = entries.map((entry: Entry, i: number) => {
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
    if (!expanded) {
      if (key.upArrow) {
        const lastEntry: item | undefined = items.pop();
        if (lastEntry) {
          items.unshift(lastEntry);
          setItems([...items]);
        }
      }

      if (key.downArrow) {
        const firstEntry: item | undefined = items.shift();
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

  const renderList: item[] = items.slice(0, ui_page_size);

  const getExpendOptions = (checked: boolean): option<returnedValue>[] => ([
    {
      label: 'See Details',
      value: 'seeDetails'
    },
    {
      label: 'Dowload Directly',
      value: 'downloadDirectly'
    },
    {
      label: !checked ? 'Add To Bulk Downloading Queue' : 'Remove From Bulk Downloading Queue',
      value: !checked ? 'addToBulkDownloadingQueue' : 'removeFromBulkDownloadingQueue'
    },
    {
      label: 'Turn Back To The List',
      value: 'turnBackToTheList'
    }
  ]);

  const handleOnSelect = (entryData: Entry, returned: returnedValue) => {
    if (returned == 'turnBackToTheList') {
      setExpanded(!expanded);
    }

    if (returned == 'addToBulkDownloadingQueue' || returned == 'removeFromBulkDownloadingQueue') {
    }
  }

  return (
    <Box 
      flexDirection='column'
      borderStyle='single' 
      borderColor='grey'
      paddingLeft={1} 
      paddingRight={1}>
      <Box flexDirection='column'>
        {
          renderList.slice(0, ui_page_size).map((item: item, i: number) => {
            const itemHovered: boolean = i == Math.floor(renderList.length / 2);
            const itemExpanded: boolean = expanded && itemHovered;
            const itemFadedOut: boolean = expanded && !itemHovered;
            const itemChecked: boolean = true;

            return <ListItem<returnedValue>
              key={item.entryData.id} 
              options={getExpendOptions(itemChecked)}
              hovered={itemHovered}
              expanded={itemExpanded}
              fadedOut={itemFadedOut}
              checked={itemChecked}
              onSelect={(returned: returnedValue) => handleOnSelect(item.entryData, returned)}>
              {item.text}
            </ListItem>
          })
        }
      </Box>
    </Box>
  );
}

export default List;

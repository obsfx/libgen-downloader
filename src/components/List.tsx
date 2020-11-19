import React, { useState, useEffect } from 'react';
import { Box, useInput, Key } from 'ink';
import { useStore } from '../store-provider';
import { Entry } from '../search-api';
import { ui_page_size } from '../app-config.json';
import ListItem from './ListItem';

const List = () => {
  type listTitle = {
    id: string;
    text: string;
  }

  const [ titles, setTitles ] = useState<listTitle[]>([]);
  const [ expanded, setExpanded ] = useState<boolean>(false);

  const currentPage: number = useStore(state => state.globals.currentPage);
  const pageSize: number = useStore(state => state.config?.pageSize) || 25;
  const entries: Entry[] = useStore(state => state.globals.entries);

  useEffect(() => {
    const titles: listTitle[] = entries.map((entry: Entry, i: number) => {
      const idx: number = i + 1 + (currentPage - 1) * pageSize;
      const extension: string = entry.extension;
      const title: string = entry.title;

      let text: string = `[${idx}] [${extension}] ${title}`;

      return { id: entry.id, text };
    });

    const renderListLength: number = ui_page_size > titles.length ? titles.length : ui_page_size;

    setTitles([ 
      ...titles.slice(titles.length - Math.floor(renderListLength / 2), titles.length), 
      ...titles.slice(0, titles.length - Math.floor(renderListLength / 2))
    ]);
  }, [entries]);

  useInput((_, key: Key) => {
    if (!expanded) {
      if (key.upArrow) {
        const lastEntry: listTitle | undefined = titles.pop();
        if (lastEntry) {
          titles.unshift(lastEntry);
          setTitles([...titles]);
        }
      }

      if (key.downArrow) {
        const firstEntry: listTitle | undefined = titles.shift();
        if (firstEntry) {
          titles.push(firstEntry);
          setTitles([...titles]);
        }
      }

      if (key.return) {
        setExpanded(!expanded);
      }
    }
  });

  const renderList: listTitle[] = titles.slice(0, ui_page_size);

  return (
    <Box 
      flexDirection='column'
      borderStyle='single' 
      borderColor='grey'
      paddingLeft={1} 
      paddingRight={1}>
      <Box flexDirection='column'>
        {
          renderList.slice(0, ui_page_size).map((title: listTitle, i: number) => (
            <ListItem 
              key={title.id} 
              hovered={i == Math.floor(renderList.length / 2)}
              expanded={expanded && i == Math.floor(renderList.length / 2)}
              fadedOut={expanded && i != Math.floor(renderList.length / 2)}
              checked={i == Math.floor(renderList.length / 2)}
              onSelect={(returned: string) => setExpanded(!expanded)}>
              {title.text}
            </ListItem>
          ))
        }
      </Box>
    </Box>
  );
}

export default List;

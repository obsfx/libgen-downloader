import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, Key } from 'ink';
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

    setTitles([ 
      ...titles.slice(titles.length - Math.floor(ui_page_size / 2), titles.length), 
      ...titles.slice(0, titles.length - Math.floor(ui_page_size / 2))
    ]);
  }, [entries]);

  useInput((_, key: Key) => {
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
  });

  return (
    <Box flexDirection='column' borderStyle='single' paddingLeft={1} paddingRight={1}>
      {
        titles.slice(0, ui_page_size).map((title: listTitle, i: number) => (
          <ListItem 
            key={title.id} 
            hovered={i == Math.floor(ui_page_size / 2)}
            checked={i == Math.floor(ui_page_size / 2)}>
            {title.text}
          </ListItem>
        ))
      }
    </Box>
  );
}

export default List;

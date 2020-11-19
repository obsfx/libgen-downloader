import React, { ReactNode, useState, useEffect } from 'react';
import { Box, Text, useInput, Key } from 'ink';

type listItemProps = {
  children?: ReactNode;
  hovered: boolean;
  checked: boolean;
}

const ListItem = (props: listItemProps) => {
  let {
    children,
    hovered,
    checked
  } = props;

  return (
    <Text wrap='truncate'>
      { hovered && <Text bold={true}>&gt;&nbsp;</Text> } 
      <Text color='greenBright'>{ checked ? 'X' : ' '}</Text>&nbsp;
      <Text bold={hovered} color={hovered ? 'yellow' : ''}>{ children }</Text> 
    </Text>
  )
}

export default ListItem;

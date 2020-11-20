import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Box, Text, useStdin } from 'ink';

type Props = {
  onMount: (value: boolean) => void
}

const Resizer = (props: Props) => {
  useEffect(() => {
    props.onMount(false);
  }, []);

  return (
    <Box>
      <Text>Resizing.....</Text>
    </Box>
  )
};

export default Resizer;

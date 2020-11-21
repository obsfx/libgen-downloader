import React, { ReactNode }from 'react';
import { Box, Text } from 'ink';
import InkSpinner from 'ink-spinner';

type Props = {
  children?: ReactNode,
}

const Spinner = (props: Props) => (
  <Box> 
    <Text color='cyanBright'>
      <InkSpinner type='dots' />
      &nbsp;
    </Text>
    { props.children }
  </Box>
)

export default Spinner;

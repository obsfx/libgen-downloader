import React from 'react';
import { Text } from 'ink';
import InkSpinner from 'ink-spinner';

type Props = {
  text: string
}

const Spinner = (props: Props) => (
  <Text> 
    <Text color='cyanBright'>
      <InkSpinner type='dots' />
    </Text>
    &nbsp; { props.text }
  </Text>
)

export default Spinner;

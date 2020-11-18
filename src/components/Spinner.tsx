import React from 'react';
import { Text } from 'ink';
import InkSpinner from 'ink-spinner';

type spinnerProps = {
  text: string
}

const Spinner = (props: spinnerProps) => (
  <Text> 
    <Text color='cyanBright'>
      <InkSpinner type='dots' />
    </Text>
    &nbsp; { props.text }
  </Text>
)

export default Spinner;

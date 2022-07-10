import React from "react";
import { Text } from "ink";
import InkSpinner from "ink-spinner";

const Spinner: React.FC<{}> = ({}) => {
  return (
    <Text color="cyanBright">
      <InkSpinner type="dots" />
    </Text>
  );
};

export default Spinner;

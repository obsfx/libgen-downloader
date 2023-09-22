import React from "react";
import { Text } from "ink";
import SpinnerText from "./SpinnerText.js";

interface Props {
  message: string;
}

export function LoadingSpinner({ message }: Props) {
  return (
    <SpinnerText>
      <Text>{message}</Text>
    </SpinnerText>
  );
}

import { Text } from "ink";
import SpinnerText from "./spinner-text";

interface Properties {
  message: string;
}

export function LoadingSpinner({ message }: Properties) {
  return (
    <SpinnerText>
      <Text>{message}</Text>
    </SpinnerText>
  );
}

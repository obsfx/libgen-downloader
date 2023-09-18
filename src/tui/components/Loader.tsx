import React from "react";
import { Text } from "ink";
import SpinnerText from "./SpinnerText";
import { useBoundStore } from "../store";

export function Loader() {
  const isLoading = useBoundStore((state) => state.isLoading);
  const loaderMessage = useBoundStore((state) => state.loaderMessage);

  if (!isLoading) {
    return null;
  }

  return (
    <SpinnerText>
      <Text>{loaderMessage}</Text>
    </SpinnerText>
  );
}

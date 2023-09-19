import React from "react";
import { Text } from "ink";
import SpinnerText from "./SpinnerText.js";
import { useBoundStore } from "../store/index.js";

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

import React from "react";
import { useAtom } from "jotai";
import { Text } from "ink";
import { isLoadingAtom, loaderMessageAtom } from "../store/app";
import SpinnerText from "./SpinnerText";

export function Loader() {
  const [isLoading] = useAtom(isLoadingAtom);
  const [loaderMessage] = useAtom(loaderMessageAtom);

  if (!isLoading) {
    return null;
  }

  return (
    <SpinnerText>
      <Text>{loaderMessage}</Text>
    </SpinnerText>
  );
}

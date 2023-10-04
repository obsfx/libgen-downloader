import React from "react";
import { Text, useFocus, useInput } from "ink";
import figures from "figures";

interface Props {
  isSelected: boolean;
  label: string;
  onSelect: () => void;
}

export function SearchByItem({ isSelected, label, onSelect }: Props) {
  const { isFocused } = useFocus();

  useInput(
    (_, key) => {
      if (key.return) {
        onSelect();
      }
    },
    { isActive: isFocused }
  );

  return (
    <Text color={isSelected ? "green" : "white"}>
      {" "}
      {isSelected ? figures.tick : " "} <Text inverse={isFocused}>{label}</Text>
      {isFocused && !isSelected ? <Text color="gray"> (Press [ENTER] to select)</Text> : ""}
    </Text>
  );
}

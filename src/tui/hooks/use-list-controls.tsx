import { useState } from "react";
import { useInput } from "ink";

export const useListControls = <T,>(
  listItems: T[],
  onReturn?: (item: T, selectedIndex: number) => void,
  isActive?: boolean
) => {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

  useInput(
    (input, key) => {
      if (input.toLowerCase() === "j" || key.downArrow) {
        let nextIndex = selectedOptionIndex + 1;
        if (selectedOptionIndex === listItems.length - 1) {
          nextIndex = 0;
        }
        setSelectedOptionIndex(nextIndex);
        return;
      }

      if (input.toLowerCase() === "k" || key.upArrow) {
        let nextIndex = selectedOptionIndex - 1;
        if (selectedOptionIndex === 0) {
          nextIndex = listItems.length - 1;
        }
        setSelectedOptionIndex(nextIndex);
        return;
      }

      if (key.return && onReturn) {
        onReturn(listItems[selectedOptionIndex], selectedOptionIndex);
      }
    },
    { isActive }
  );

  return { selectedOptionIndex };
};

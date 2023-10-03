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
        const nextIndex =
          selectedOptionIndex === listItems.length - 1 ? 0 : selectedOptionIndex + 1;
        setSelectedOptionIndex(nextIndex);
        return;
      }

      if (input.toLowerCase() === "k" || key.upArrow) {
        const nextIndex =
          selectedOptionIndex === 0 ? listItems.length - 1 : selectedOptionIndex - 1;
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

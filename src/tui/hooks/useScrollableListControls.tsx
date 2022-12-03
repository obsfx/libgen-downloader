import { useInput, Key } from "ink";
import { Dispatch, SetStateAction } from "react";

export const useScrollableListControls = <T,>(
  listItems: T[],
  setListItems: Dispatch<SetStateAction<T[]>>,
  isActive?: boolean
) => {
  useInput(
    (input: string, key: Key) => {
      if (input.toLowerCase() === "j" || key.downArrow) {
        setListItems([...listItems.slice(1, listItems.length), listItems[0]]);
        return;
      }

      if (input.toLowerCase() === "k" || key.upArrow) {
        setListItems([
          listItems[listItems.length - 1],
          ...listItems.slice(0, listItems.length - 1),
        ]);
        return;
      }
    },
    {
      isActive,
    }
  );
};

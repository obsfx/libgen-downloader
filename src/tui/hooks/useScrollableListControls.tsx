import { useInput, Key } from "ink";
import { Dispatch, SetStateAction } from "react";

export const useScrollableListControls = (
  setCursorIndex: Dispatch<SetStateAction<number>>,
  listLength: number,
  isActive?: boolean
) => {
  useInput(
    (input: string, key: Key) => {
      if (input.toLowerCase() === "j" || key.downArrow) {
        setCursorIndex((prev) => (prev + 1) % listLength);
        return;
      }

      if (input.toLowerCase() === "k" || key.upArrow) {
        setCursorIndex((prev) => (prev - 1 + listLength) % listLength);
        return;
      }
    },
    {
      isActive,
    }
  );
};

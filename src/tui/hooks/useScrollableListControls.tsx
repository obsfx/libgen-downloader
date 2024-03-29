import { useInput } from "ink";

export const useScrollableListControls = (
  cursorIndex: number,
  setCursorIndex: (listItemCursor: number) => void,
  listLength: number,
  isActive?: boolean
) => {
  useInput(
    (input, key) => {
      if (input.toLowerCase() === "j" || key.downArrow) {
        setCursorIndex((cursorIndex + 1) % listLength);
        return;
      }

      if (input.toLowerCase() === "k" || key.upArrow) {
        setCursorIndex((cursorIndex - 1 + listLength) % listLength);
        return;
      }
    },
    {
      isActive,
    }
  );
};

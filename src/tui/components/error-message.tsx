import { Box, Text } from "ink";
import OptionList from "./option-list";
import { useBoundStore } from "../store";
import Label from "../../labels";
import { ErrorMessageOption } from "../../options";

export function ErrorMessage() {
  const errorMessage = useBoundStore((state) => state.errorMessage);
  const handleExit = useBoundStore((state) => state.handleExit);
  const setErrorMessage = useBoundStore((state) => state.setErrorMessage);
  const handleSearchSubmit = useBoundStore((state) => state.handleSearchSubmit);
  const searchValue = useBoundStore((state) => state.searchValue);

  const canRetry = searchValue.length >= 3;

  return (
    <Box flexDirection="column">
      <Box>
        <Text>
          Something went wrong:
          <Text> {errorMessage}</Text>
        </Text>
      </Box>

      <OptionList
        options={{
          ...(canRetry && {
                [ErrorMessageOption.RETRY]: {
                  label: Label.RETRY,
                  onSelect: () => {
                    setErrorMessage(undefined);
                    handleSearchSubmit();
                  },
                },
              }),
          [ErrorMessageOption.EXIT]: {
            label: Label.EXIT,
            onSelect: () => handleExit(),
          },
        }}
      />
    </Box>
  );
}

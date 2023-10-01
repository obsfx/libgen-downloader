import React from "react";
import { Box, Text } from "ink";
import { useBoundStore } from "../../../store/index.js";
import { SearchByItem } from "./SearchByItem.js";

export function SearchBy() {
  const columnFilterQueryParamValues = useBoundStore((state) => state.columnFilterQueryParamValues);
  const selectedSearchByOption = useBoundStore((state) => state.selectedSearchByOption);
  const setSelectedSearchByOption = useBoundStore((state) => state.setSelectedSearchByOption);

  const selectedSearchByOptionLabel = selectedSearchByOption
    ? Object.entries(columnFilterQueryParamValues).find(
        ([, value]) => value === selectedSearchByOption
      )?.[0]
    : "Default";

  return (
    <Box flexDirection="column">
      <Box height={1}>
        <Text bold>Search by: </Text>
        <Text bold color="green">
          {selectedSearchByOptionLabel}
        </Text>
      </Box>
      <Box flexDirection="column">
        <SearchByItem
          key={"default"}
          isSelected={selectedSearchByOption === null}
          label={"Default"}
          onSelect={() => {
            setSelectedSearchByOption(null);
          }}
        />

        {Object.entries(columnFilterQueryParamValues).map(([key, value]) => {
          return (
            <SearchByItem
              key={key}
              isSelected={selectedSearchByOption === value}
              label={key}
              onSelect={() => {
                setSelectedSearchByOption(value);
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}

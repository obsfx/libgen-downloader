import React, { useCallback } from "react";
import { useFocus } from "ink";

import Input from "../../../components/Input";
import { FilterKey } from "./Filter.data";
import { useBoundStore } from "../../../store";

const FilterInput: React.FC<{
  label: string;
  filterKey: FilterKey;
}> = ({ label, filterKey }) => {
  const filters = useBoundStore((state) => state.filters);
  const setFilters = useBoundStore((state) => state.setFilters);

  const { isFocused } = useFocus({ autoFocus: true });

  const handleInputChange = useCallback(
    (val: string) => {
      setFilters({
        ...filters,
        [filterKey]: val,
      });
    },
    [filters, filterKey, setFilters]
  );

  return (
    <Input
      label={label}
      placeholder=""
      isFocused={isFocused}
      searchValue={filters[filterKey] || ""}
      onSearchValueChange={handleInputChange}
    />
  );
};

export default FilterInput;
